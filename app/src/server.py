import json
from flask import Flask, render_template, request, redirect, url_for
from analyze import analyze
from youtube import YouTube
from database import Database

server = Flask(__name__)
yt = YouTube()
db = Database()

@server.route('/')
def home():
    database_videos = db.recent(10)
    return render_template("list.html", database_videos=database_videos)

@server.route('/search', methods=["POST"])
def search():
    key = request.form.get("key")
    youtube_videos = yt.search(key)
    return render_template("list.html", youtube_videos=youtube_videos)

@server.route('/recent')
def recent(n=10):
    database_videos = db.recent(n)
    return render_template("list.html", database_videos=database_videos)

@server.route('/top')
def top(n=10):
    database_videos = db.top(n)
    return render_template("list.html", database_videos=database_videos)

@server.route('/video/<videoId>')
def video(videoId):
    video_data = db.video(videoId)
    if video_data == None:
        analyze(videoId)
        return redirect(url_for('video', videoId=videoId))
    else:
        comment_data = db.comments(videoId)
        return render_template("video.html", video_data=video_data, comment_data=comment_data)

if __name__ == "__main__":
    server.run(debug=True, host="0.0.0.0", port=5000)