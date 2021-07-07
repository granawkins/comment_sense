from database import Database
from youtube import YouTube
from clusterer import Clusterer

env = 'desktop'
db_name = 'comment_sense_3'
db = Database(env, db_name)
yt = YouTube()

videoId = 'kQibkV_V8-c'
video_data = yt.video(videoId)
comment_topics = db.comment_topics(videoId)

cl = Clusterer(video_data, db)
topics = cl.cluster(comment_topics)
print(topics)