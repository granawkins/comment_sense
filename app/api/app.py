import json, time, queue, sys
from concurrent.futures import ThreadPoolExecutor
import threading

from youtube import YouTube
from database import Database
from analyzer import Analyzer
from clusterer import Clusterer, cluster
from id_hash import hash
import socketio
import eventlet

env='desktop'
db_name = 'comment_sense'

yt = YouTube()
db = Database(env, name=db_name)
an = Analyzer(env, db)

sio = socketio.Server(cors_allowed_origins='*', async_mode='eventlet')
app = socketio.WSGIApp(sio)

rooms = []

@sio.event
def connect(sid, environ):
    print(f'connected to {sid}.')

@sio.event
def disconnect(sid):
    print(f'disconnected from {sid}.')

@sio.event
def recent(sid, data):
    if data['n']:
        database_videos = db.recent(data['n'])
        return {'videos': database_videos}

@sio.event
def search(sid, data):
    if data['key']:
        database_videos = yt.search(data['key'])
        return {'videos': database_videos}

@sio.event
def video(sid, data):
    global rooms
    if data['videoId']:
        videoId = data['videoId']
        video_data = yt.video(videoId)

        db_data = db.video(videoId)
        video_data['topics'] = [] if not db_data else db_data['topics']
        video_data['n_analyzed'] = 0 if not db_data else db_data['n_analyzed']

        if videoId in rooms:
            sio.enter_room(sid, videoId)

        sio.emit('video', {'video': video_data}, to=sid)

@sio.event
def comments(sid, data):
    comments_data = db.comments(data['comments'])
    sio.emit('comments', {'comments': comments_data}, to=sid)

@sio.event
def topics(sid, data):
    video_data = db.video(data['videoId'])
    topics_data = []
    n_analyzed = 0
    if video_data:
        if 'topics' in video_data.keys():
            topics_data = video_data['topics']
        if 'n_analyzed' in video_data.keys():
            n_analyzed = video_data['n_analyzed']
    sio.emit('topics', {'topics': topics_data, 'n_analyzed': n_analyzed}, to=sid)

@sio.event
def analyze(sid, data):

    # Parse request info
    video_data = data['videoData']
    videoId = video_data['id']
    n_target = int(data['nComments'])

    # Initialize progress object. Used to send data to frontend
    progress = {
        'loaded': 0, 
        'analyzed': 0, 
        'clustered': 0, 
        'status': 'init', 
        'topics': video_data['topics']}

    # Add user to room to receive websocket updates
    global rooms
    rooms.append(videoId)
    sio.enter_room(sid, videoId)
    sio.emit('loading', progress, room=videoId)

    # Get comments from YouTube API
    comment_data = yt.comments(videoId, {'nComments': n_target})
    # -> [[id, videoId, text, author, parent, likes, published], ...]
    
    # Get analyzed comments and add to database
    comments_analyzed = an.analyze(comment_data)
    # -> [[id, likes, sentiment, topics], ...]

    # Extract a sorted list of topics from comments
    cl = Clusterer(video_data, db)
    topics_raw = cl.cluster(comments_analyzed)
    # -> [[token, toks, label, n, likes, sentiment, commentIds], ...]
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
    n_actual = len(comments_analyzed)
    progress['loaded'] = n_actual
    progress['analyzed'] = n_actual
    progress['clustered'] = n_actual
    progress['status'] = 'done'
    progress['topics'] = video_data['topics']

    sio.emit('loading', progress, room=videoId)
    rooms.remove(videoId)

# if __name__ == '__main__':
eventlet.wsgi.server(eventlet.listen(('', 5050)), app)
