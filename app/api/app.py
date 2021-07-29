import json, time, queue, sys, os
import logging
from flask import Flask, render_template, request, redirect, url_for
from youtube import YouTube
from database import Database
from analyzer import Analyzer
from clusterer import Clusterer, cluster, cluster_topics
from id_hash import hash

# Initialize Logger
logger = logging.getLogger('cs_api')
logger.setLevel(logging.DEBUG)
# Set custom logger for all comment_sense calls
cs = logging.FileHandler('api/logs/cs_logs.log')
cs.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
cs.setFormatter(formatter)
logger.addHandler(cs)

env='desktop'
db_name = 'comment_sense_6'

app = Flask(__name__)
yt = YouTube()
db = Database(env, name=db_name)
an = Analyzer(env, db)

# USER


@app.route('/api/get_youtube_videos', methods=['POST'])
def get_youtube_videos():
    # Parse the request
    request_data = request.get_json()
    user = request_data['user']
    if 'channelId' not in user.keys():
        return
    channel_id = user['channelId']
    published_after = None if not 'publishedAfter' in request_data.keys() else request_data['publishedAfter']
    max_videos = None if not 'maxVideos' in request_data.keys() else int(request_data['maxVideos'])

    # Working variables
    all_ids = [] # Get from database by channelId
    all_videos = []
    total_videos = None
    next_page = None
    end = False
    error = False
    while not end and not error:
        try:
            # Send request
            args = {'channel_id': channel_id}
            if published_after:
                args['published_after'] = published_after
            if next_page:
                args['next_page'] = next_page
            response = yt.get_channel_videos(**args)
            # Parse response
            resp_videos = response['videos']
            new_videos = [v for v in resp_videos if v['videoId'] not in all_ids]
            # Evaluate loop status
            if len(new_videos) == 0:
                end = "No videos returned"
            else:
                all_videos.extend(new_videos)
                all_ids.extend([v['videoId'] for v in new_videos])
                if not total_videos:
                    total_videos = int(response['total_videos'])
                if (len(all_videos) >= max_videos) | (len(all_videos) == total_videos):
                    end = "Reached target number of videos"
                next_page = response['next_page']
        except:
            error = "Error getting results from YouTube"

    with open('casey_videos.json', 'w') as f:
        print(f'dumping {len(all_videos)} out of {total_videos} videos to json.')
        json.dump(all_videos, f)

    # save to database: all_videos, total_videos, next_page, last_scan (date)
    return {'all_videos': all_videos, 'total_videos': total_videos,
            'next_page': next_page, 'end': end, 'error': error}

@app.route('/api/videos', methods=['POST'])
def videos():
    request_data = request.get_json()
    user = request_data['user']
    if 'channelId' not in user.keys():
        return
    args = {
        'channelId': user['channelId'],
        'search': request_data['search'],
        'sort': request_data['sort'],
        'n': request_data['pageSize'],
        'page': request_data['pageNumber'],
    }
    logger.info(f"videos - {json.dumps(args)}")
    db_data = db.videos(**args)
    videos = db_data['videos']
    return {'items': videos}

@app.route('/api/topics', methods=['POST'])
def topics():
    request_data = request.get_json()
    user = request_data['user']
    request_type = 'video' if (request_data['videoId']) else 'channel'
    if 'channelId' not in user.keys():
        return
    args = {
        'channelId': user['channelId'],
        'search': request_data['search'],
        'sort': request_data['sort'],
    }
    if request_type == 'video':
        args['videoId'] = request_data['videoId']

    logger.info(f"videos - {json.dumps(args)}")
    db_data = db.topics(**args)
    if request_type == 'video':
        topics = json.loads(db_data['videos'][0]['topics'])
    else:
        topics = cluster_topics(db_data['videos'])

    with open('casey_topics.json', 'w') as f:
        json.dump(topics, f)

    n = int(request_data['pageSize'])
    page = int(request_data['pageNumber'])
    start = min(len(topics), int(n) * (int(page) - 1))
    finish = min(len(topics), start + int(n))
    return {'items': topics[start:finish]}


@app.route('/api/video/<videoId>', methods=['GET'])
def video(videoId):
    logger.info(f"video - {videoId}")
    video_data = yt.video(videoId)
    db_data = db.video(videoId)
    video_data['topics'] = [] if not db_data else db_data['topics']
    video_data['n_analyzed'] = 0 if not db_data else db_data['n_analyzed']
    video_data['next_page_token'] = None if not db_data else db_data['next_page_token']
    return {'video_data': video_data}

@app.route('/api/comments', methods=['POST'])
def comments():
    request_data = request.get_json()
    comment_ids = request_data['comments']
    logger.info(f"comments - {request_data['videoId']}, {request_data['topic']}")
    comments = db.comments(comment_ids)
    return {'comments': comments}

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Parse request info
    request_data = request.get_json()
    video_data = request_data['videoData']
    videoId = video_data['id']
    n_target = int(request_data['nComments'])
    if 'next_page_token' in video_data.keys():
        page_token =  video_data['next_page_token']
        old_analyzed = db.all_comments(videoId)
    else:
        page_token = None
        old_analyzed = []

    # Get comments from YouTube API
    logger.info(f"youtube_comments - {videoId}, {n_target}")
    comment_data, next_page_token = yt.comments(videoId, n_target, page_token)
    # -> [[id, videoId, text, author, parent, likes, published], ...]

    # Get analyzed comments and add to database
    logger.info(f"analyze - {videoId}, {len(comment_data)}")
    new_analyzed = an.analyze(comment_data)
    # -> [[id, likes, sentiment, topics], ...]

    video_data['next_page_token'] = json.dumps(next_page_token)
    analyzed = old_analyzed + new_analyzed
    video_data['n_analyzed'] = len(analyzed)

    # Extract a sorted list of topics from comments
    n_topics = 200
    subs = []
    user_labs = []
    logger.info(f"cluster - {videoId}, {len(analyzed)}")
    topics_raw = cluster(analyzed, n_topics, subs, user_labs)
    # -> [[token, toks, label, n, likes, sentiment, commentIds], ...]

    # Add topics to database
    topics_data = [{
        'token': token,
        'toks': toks,
        'score': n,
        'likes': likes,
        'sentiment': sentiment,
        'type': label,
        'comments': commentIds
    } for (token, toks, label, n, likes, sentiment, commentIds) in topics_raw]
    video_data['topics'] = json.dumps(topics_data)
    db.add_video(video_data)

    # Send results to frontend
    return {'video_data': video_data}


# ADMIN

@app.route('/api/blogs', methods=['GET'])
def blogs():
    db_data = db.get_blog_posts()
    return {'posts': db_data}

@app.route('/api/get_blog_post/<permalink>', methods=['GET'])
def get_blog_post(permalink):
    post = None
    try:
        logger.info(f"blog - {permalink}")
        post = db.get_blog_post({'permalink': permalink})
    except:
        print("Unexpected error retrieving blog post:", sys.exc_info()[0])
    finally:
        return {'blog': post}

@app.route('/api/add_blog', methods=['POST'])
def add_blog():
    new_post = request.get_json()
    successful = False
    try:
        db.add_blog_post(new_post)
        successful = True
    except:
        print("Unexpected error:", sys.exc_info()[0])
    finally:
        return {'successful': successful}

@app.route('/api/remove_blog', methods=['POST'])
def remove_blog():
    post = request.get_json()
    id = post['id']
    successful = False
    if id:
        try:
            db.remove_blog_post(id)
            successful = True
        except:
            print("Unexpected error:", sys.exc_info()[0])
        finally:
            return {'successful': successful}
    else:
        return {'successful': successful}

@app.route('/api/add_feedback', methods=['POST'])
def add_feedback():
    feedback = request.get_json()
    successful = False
    try:
        db.add_feedback(feedback)
        successful = True
    except:
        print("Unexpected error:", sys.exc_info()[0])
    finally:
        return {'successful': successful}

@app.route('/api/get_feedback', methods=['GET'])
def get_feedback():
    try:
        all_feedback = db.get_feedback()
        feedback = sorted(all_feedback, key=lambda k: k['created'], reverse=True)

    except:
        print("Unexpected error:", sys.exc_info()[0])
        feedback = None
    finally:
        return {'feedback': feedback}

@app.route('/api/get_logs', methods=['POST'])
def get_logs():
    params = request.get_json() # ignore for now
    results = []
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, 'logs/cs_logs.log')
    with open(file_path) as f:
        for line in f:
            results.append(line)
    return {'logs': results}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
