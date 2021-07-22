import json, time, queue, sys
from flask import Flask, render_template, request, redirect, url_for
from youtube import YouTube
from database import Database
from analyzer import Analyzer
from clusterer import Clusterer, cluster
from id_hash import hash

env='desktop'
db_name = 'comment_sense_6'

app = Flask(__name__)
yt = YouTube()
db = Database(env, name=db_name)
an = Analyzer(env, db)

@app.route('/api/recent', methods=['GET', 'POST'])
def recent():
    videos_per_page = 10
    request_data = request.get_json()
    page_number = request_data['page']
    database_videos = db.recent(int(videos_per_page), int(page_number))
    return {'videos': database_videos}

@app.route('/api/popular', methods=['GET', 'POST'])
def popular():
    videos_per_page = 10
    request_data = request.get_json()
    page_number = request_data['page']
    database_videos = db.popular(int(videos_per_page), int(page_number))
    return {'videos': database_videos}

@app.route('/api/search', methods=['GET', 'POST'])
def search():
    results_per_page = 10
    request_data = request.get_json()
    key = request_data['key']
    if not key:
        return {'videos': []}
    args = {
        'key': key,
        'n': results_per_page
    }
    if 'next' in request_data.keys():
        args['page_token'] = request_data['next']
    results = yt.search(**args)
    return {
        'videos': results['videos'],
        'channels': results['channels'],
        'next': results['next']}

@app.route('/api/video/<videoId>', methods=['GET'])
def video(videoId):
    video_data = yt.video(videoId)
    db_data = db.video(videoId)
    video_data['topics'] = [] if not db_data else db_data['topics']
    video_data['n_analyzed'] = 0 if not db_data else db_data['n_analyzed']
    video_data['next_page_token'] = None if not db_data else db_data['next_page_token']
    return {'video_data': video_data}

@app.route('/api/topics', methods=['POST'])
def topics():
    topics_per_page = 20
    request_data = request.get_json()
    videoId = request_data['videoId']
    page_number = request_data['page']
    args = {
        'videoId': videoId,
        'n': topics_per_page,
    }
    if 'page' in request_data:
        args['page'] = request_data['page']
    db_data = db.topics(**args)
    return {'topics': db_data}

@app.route('/api/comments', methods=['POST'])
def comments():
    request_data = request.get_json()
    comment_ids = request_data['comments']
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
    comment_data, next_page_token = yt.comments(videoId, n_target, page_token)
    # -> [[id, videoId, text, author, parent, likes, published], ...]

    # Get analyzed comments and add to database
    new_analyzed = an.analyze(comment_data)
    # -> [[id, likes, sentiment, topics], ...]

    video_data['next_page_token'] = json.dumps(next_page_token)
    analyzed = old_analyzed + new_analyzed
    video_data['n_analyzed'] = len(analyzed)

    # Extract a sorted list of topics from comments
    n_topics = 200
    subs = []
    user_labs = []
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

@app.route('/api/blogs', methods=['GET'])
def blogs():
    db_data = db.get_blog_posts()
    return {'posts': db_data}

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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
