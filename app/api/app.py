import json, re, sys, os, datetime
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
db_name = 'cs_test_4'

app = Flask(__name__)
yt = YouTube()
db = Database(env, name=db_name)
an = Analyzer(env, db)

# USER

def check_channel(channel_id):
    """Check if channel_id is correct. If not, try to get id for username.
    """
    new_id = None
    is_channel = re.search(r'[0-9A-Za-z_-]{21}[AQgw]', channel_id)
    if not is_channel:
        try:
            searched_id = yt.get_id(channel_id)
            new_id = searched_id
        except Exception as e:
            return {'error': f'Error with channelId {channel_id}: {e}'}
    else:
        new_id = channel_id
    return new_id


@app.route('/api/channel', methods=['POST'])
def channel():
    """Return channel data. If not in db, get from youtube and add to db.
    """
    request_data = request.get_json()
    if 'channelId' not in request_data.keys():
        return {'error': 'No channel specified'}
    channel_id = request_data['channelId']
    channel_id = check_channel(channel_id)
    # Try to get it from database.
    try:
        data = db.get_channel(channel_id)
    except Exception as e:
        return {'error': f'Error loading video from Database: {e}'}

    if 'channel' in data.keys():
        channel = data['channel']
        return {'channel': channel}
    else:
        # If not in database, get from YouTube
        # TODO: If allow searching by username instead of channel_id
        logger.info(f"youtube_channel - {channel_id}")
        try:
            response = yt.channel(channel_id)
        except Exception as e:
            return {'error': f'Error loading channel from YouTube: {e}'}
        if 'error' in response.keys():
            return {'error': response['error']}
        channel = response['channel']

        # Add it to the database, then return the NEW (db) item
        try:
            db.set_channel(channel_id, channel)
            data = db.get_channel(channel_id)
        except Exception as e:
            return {'error': f'Error adding YouTube video to database: {e}'}
        channel = data['channel']
        return {'channel': channel}


@app.route('/api/scan_videos', methods=['POST'])
def scan_videos():
    """Search YouTube videos by channelId and return results

    """
    # Parse the request
    request_data = request.get_json()
    user = request_data['user']
    if 'channelId' not in user.keys():
        return
    channel_id = user['channelId']
    channel_id = check_channel(channel_id)

    published_after = None if not 'publishedAfter' in request_data.keys() else request_data['publishedAfter']

    # Abandon the next_page_token stored in channel and start over from page 1. Max_retries determines
    # how many empty pages to cycle through looking for new videos.
    reset_token = None if not 'resetToken' in request_data.keys() else request_data['resetToken']
    max_retries = 10

    # The target number of new videos. If it's the first scan, this is equal to the total videos returned.
    # If reset_token is called, this number doesn't include videos seen but already in database.
    max_videos = None if not 'maxVideos' in request_data.keys() else int(request_data['maxVideos'])

    # Get existing channel data
    db_channel = db.get_channel(channel_id)
    if 'channel' not in db_channel:
        return {'error': 'Channel not in database'}
    channel = db_channel['channel']
    next_page_token = None if ((reset_token) or ('next_page_token' not in channel.keys())) \
                      else channel['next_page_token']
    total_videos = None if 'total_videos' not in channel else channel['total_videos']

    # Working variables
    db_videos = db.get_videos(channel_id, all=True)
    all_ids = [video['id'] for video in db_videos['videos']]
    new_ids = []
    end = False
    error = False
    while not end and not error and max_retries > 0:
        # Create request
        args = {'channel_id': channel_id}
        if published_after:
            args['published_after'] = published_after
        if next_page_token:
            args['next_page_token'] = next_page_token
        logger.info(f"youtube_videos - {json.dumps(args)}")

        try:
            response = yt.videos(**args)
        except Exception as e:
            error = f"Error getting videos from YouTube: {e}"
            break

        # Parse response
        resp_videos = response['videos']
        total_videos = int(response['total_videos'])

        if len(resp_videos) == 0:
            end = "No videos returned"
        else:
            # Don't consider videos that are already in database
            new_videos = [v for v in resp_videos if v['id'] not in all_ids]
            if len(new_videos) == 0:
                max_retries -= 1

            else:
                loop_ids = [v['id'] for v in new_videos]
                all_ids.extend(loop_ids)
                new_ids.extend(loop_ids)
                for video in new_videos:
                    video['channel_id'] = channel_id
                    db.set_video(video['id'], video)
                if (len(new_ids) >= max_videos) | (len(all_ids) == total_videos):
                    end = "Reached target number of videos"

            # Sometimes there is no next_page_token, even though the total_results is not reached.
            if not response['next_page_token']:
                end = "End of search results"
            else:
                next_page_token = response['next_page_token']


    # Update database entry
    reset_channel = {
        'total_videos': total_videos,
        'last_scan': datetime.datetime.now(),
        'next_page_token': next_page_token,
        'db_videos': len(all_ids)
    }
    db.set_channel(channel_id, reset_channel)

    return {'db_videos': len(all_ids), 'next_page_token': next_page_token,
            'total_videos': total_videos, 'end': end, 'error': error}


@app.route('/api/videos', methods=['POST'])
def videos():
    request_data = request.get_json()
    user = request_data['user']
    if 'channelId' not in user.keys():
        return
    args = {
        'channel_id': user['channelId'],
        'search': None if not 'search' in request_data else request_data['search'],
        'sort': None if not 'sort' in request_data else request_data['sort'],
    }
    if 'pageSize' in request_data:
        args['n'] = request_data['pageSize']
    if 'pageNumber' in request_data:
        args['page'] = request_data['pageNumber']
    if 'all' in request_data:
        args['all'] = request_data['all']
    logger.info(f"videos - {json.dumps(args)}")
    db_data = db.get_videos(**args)
    videos = db_data['videos']
    return {'items': videos}


@app.route('/api/analyze_comments', methods=['POST'])
def analyze_comments():
    """Get new comments, analyze, add to db, refresh video
    """
    # ---STEP 1: GET COMMENTS FROM YOUTUBE
    # Parse the request
    request_data = request.get_json()
    user = request_data['user']
    if 'channelId' not in user.keys():
        return
    channel_id = user['channelId']
    channel_id = check_channel(channel_id)
    video_id = request_data['videoId']

    # Abandon the next_page_token stored in the video and start over form page 1.
    reset_token = None if not 'resetToken' in request_data else request_data['resetToken']
    max_retries = 10

    # Total number of NEW comments to be returned
    max_comments = int(request_data['nComments'])

    # Get comments from YT in this order
    sort = None if not 'sort' in request_data else request_data['sort']

    # Get existing video data
    db_video = db.get_video(video_id)
    if 'video' not in db_video:
        return {'error': 'Video not in database'}
    video = db_video['video']
    next_page_token = None if ((reset_token) or ('next_page_token' not in video.keys())) \
                      else video['next_page_token']
    total_comments = None if 'total_comments' not in video else video['total_comments']

    db_comments = db.get_comments(video_id=video_id, all=True)
    all_ids = [comment['id'] for comment in db_comments['comments']]
    new_comments = []
    end = False
    error = False
    while not end and not error and max_retries > 0:
        args = {'video_id': video_id}
        if next_page_token:
            args['next_page_token'] = next_page_token
        if sort:
            args['sort'] = sort
        logger.info(f"youtube_comments - {json.dumps(args)}")

        try:
            response = yt.comments(**args)
        except Exception as e:
            error = f"Error getting comments from YouTube: {e}"
            break

        resp_comments = response['comments']
        if len(resp_comments) == 0:
            end = 'No comments returned'
        else:
            loop_comments = [c for c in resp_comments if c['id'] not in all_ids]
            if len(loop_comments) == 0:
                max_retries -= 1
            else:
                loop_ids = [c['id'] for c in loop_comments]
                all_ids.extend(loop_ids)
                for comment in loop_comments:
                    comment['channel_id'] = channel_id
                new_comments.extend(loop_comments)
                if (len(new_comments) >= max_comments) | (len(all_ids) == total_comments):
                    end = "Reached target number of comments"

            if not response['next_page_token']:
                end = "End of search results"
            else:
                next_page_token = response['next_page_token']

    # ---STEP 2: ANALYZE & ADD TO DATABASE
    logger.info(f"analyze - {video_id}, {len(new_comments)}")
    new_analyzed = an.analyze(new_comments)
    for c in new_analyzed:
        db.set_comment(c['id'], c)

    # --STEP 3: REFRESH VIDEO
    all_comments = new_comments + db_comments['comments']

    n_topics = 200
    args = {
        'comment_topics': all_comments,
        'n_topics': n_topics,
    }
    db_channel = db.get_channel(channel_id)
    if 'error' in db_channel:
        return {'error': 'Error getting channel data for cluster.'}
    c = db_channel['channel']
    for field in ['subs_list', 'labels_list', 'ignore_list']:
        if c[field]:
            args[field] = c[field]
    raw_topics = cluster(**args)
    video_topics = [{
        'token': token,
        'toks': toks,
        'score': n,
        'likes': likes,
        'sentiment': sentiment,
        'label': label,
        'comments': commentIds
    } for (token, toks, label, n, likes, sentiment, commentIds) in raw_topics]

    # --STEP 4: UPDATE DB VIDEO
    timestamp = datetime.datetime.now()
    reset_video = {
        'db_comments': len(all_ids),
        'next_page_token': next_page_token,
        'last_scan': timestamp,
        'topics': video_topics,
        'last_refresh': timestamp,
    }
    db.set_video(video_id, reset_video)

    # --STEP 5: RETURN
    # Return all fields except topics, which will be retrieved page-by-page
    # by the feed when 'last_refresh' is updated on the front-end.
    refreshed_video = {**video, **reset_video}
    del refreshed_video['topics']
    return {'video': refreshed_video}

# BELOW NOT REVIEWED

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
