import json, time, queue, sys
from concurrent.futures import ThreadPoolExecutor
import threading

from youtube import YouTube
from database import Database
from scraper import Scraper
from analyzer import Analyzer
from clusterer import Clusterer, cluster
from id_hash import hash
import socketio
import eventlet

env='desktop'
db_name = 'comment_sense_3'

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

@sio.event # api.route('/comments', methods=['POST', 'GET'])
def comments(sid, data):
    comments_data = db.comments(data['comments'])
    sio.emit('comments', {'comments': comments_data}, to=sid)

@sio.event # api.route('/topics/<videoId>')
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
    global rooms
    video_data = data['videoData']
    videoId = video_data['id']
    rooms.append(videoId)
    sio.enter_room(sid, videoId)
    n = int(data['nComments'])

    cl = Clusterer(video_data, db)
    sc = Scraper(env)

    progress = {
        'loaded': 0, 
        'analyzed': 0, 
        'clustered': 0, 
        'status': 'init', 
        'topics': video_data['topics']}
    
    # Initialize Chrome
    sio.emit('loading', progress, room=videoId)
    sc.load_video(videoId)     
    sc.scroll(to='start')
    progress['status'] = 'load'
    sio.emit('loading', progress, room=videoId)
    eventlet.sleep(1)
    progress['status'] = 'scrape'
    sio.emit('loading', progress, room=videoId)

    # Scrape Comments
    error = None
    try:
        initialized = threading.Event()
        aborted = threading.Event()
        comment_pipeline = queue.Queue()
        topics_pipeline = queue.Queue()
        with ThreadPoolExecutor(max_workers=4) as executor:
            executor.submit(sc.stream, n, progress, comment_pipeline, initialized, aborted)
            executor.submit(an.stream, n, progress, comment_pipeline, topics_pipeline, initialized, aborted)
            executor.submit(cl.stream, n, progress, topics_pipeline, initialized, aborted)
            
            while (progress['clustered'] < n) & (not aborted.is_set()):
                sio.emit('loading', progress, room=videoId)
                eventlet.sleep(1)
    except:
        error = sys.exc_info()[0]
    finally:
        progress['status'] = 'done'
        progress['error'] = error
        sio.emit('loading', progress, room=videoId)
        rooms.remove(videoId)

# if __name__ == '__main__':
eventlet.wsgi.server(eventlet.listen(('', 5050)), app)