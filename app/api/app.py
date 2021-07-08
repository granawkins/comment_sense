import json, time, queue, sys
from flask import Flask, render_template, request, redirect, url_for
from youtube import YouTube
from database import Database
from analyzer import Analyzer
from clusterer import Clusterer, cluster
from id_hash import hash

env='desktop'
db_name = 'comment_sense_3'

app = Flask(__name__)
yt = YouTube()
db = Database(env, name=db_name)
an = Analyzer(env, db)

@app.route('/api/recent', methods=['GET'])
def recent():
    database_videos = db.recent(10)
    return {'videos': database_videos}

@app.route('/api/search/<key>', methods=['GET'])
def search(key):
    if not key:
        return {'videos': []}
    youtube_videos = yt.search(key)
    return {'videos': youtube_videos}

@app.route('/api/video/<videoId>', methods=['GET'])
def video(videoId):
    video_data = yt.video(videoId)
    db_data = db.video(videoId)
    video_data['topics'] = [] if not db_data else db_data['topics']
    video_data['n_analyzed'] = 0 if not db_data else db_data['n_analyzed']
    return {'video_data': video_data}

@app.route('/api/comments', methods=['POST'])
def comments():
    request_data = request.get_json()
    comments_data = db.comments(request_data['comments'])
    return comments_data

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Parse request info
    request_data = request.get_json()
    video_data = request_data['videoData']
    videoId = video_data['id']
    n_target = int(request_data['nComments'])

    # Get comments from YouTube API
    comment_data = yt.comments(videoId, {'nComments': n_target})
    # -> [[id, videoId, text, author, parent, likes, published], ...]
    
    # Get analyzed comments and add to database
    comments_analyzed = an.analyze(comment_data)
    # -> [[id, likes, sentiment, topics], ...]

    # Extract a sorted list of topics from comments
    n_topics = 200
    subs = []
    user_labs = []
    topics_raw = cluster(comments_analyzed, n_topics, subs, user_labs)
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
    return video_data

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
