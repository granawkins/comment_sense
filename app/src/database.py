import mysql.connector
import json
from get_docker_secret import get_docker_secret

pw = get_docker_secret('db-password', default='password')

class Database():

  def __init__(self):
    self.db = mysql.connector.connect(
      host="db",
      user="root",
      password=pw,
    )
    self.cursor = self.db.cursor(dictionary=True)

    # Setup Database
    self.cursor.execute("CREATE DATABASE IF NOT EXISTS youtube_comments")
    self.cursor.execute("USE youtube_comments")
    self.createCommentsTable()
    self.createVideosTable()

  def refresh(self):
    self.db = mysql.connector.connect(
        host="db",
        user="root",
        password=pw,
        database="youtube_comments",
    )
    self.cursor = self.db.cursor(dictionary=True)

  def createCommentsTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS comments ( "
        "id VARCHAR(255), "
        "level INT(6), "
        "videoID VARCHAR(60), "
        "channelId VARCHAR(60), "
        "channelTitle VARCHAR(60), "
        "textDisplay VARCHAR(1000), "
        "authorDisplayName VARCHAR(255), "
        "likedCount SMALLINT(255) UNSIGNED, "
        "publishedAt VARCHAR(255), "
        "polarity FLOAT(24), "
        "subjectivity FLOAT(24), "
        "status VARCHAR(10),"
        "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ")")
    self.db.commit()

  def createVideosTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS videos ( "
        "id VARCHAR(255), "
        "title VARCHAR(300), "
        "channelId VARCHAR(100), "
        "thumbnail VARCHAR(50), "
        "views INTEGER(15), "
        "likes INTEGER(10), "
        "dislikes INTEGER(10), "
        "comments INTEGER(10), "
        "polarity FLOAT(24), "
        "subjectivity FLOAT(24), "
        "positive FLOAT(24), "
        "neutral FLOAT(24), "
        "negative FLOAT(24), "
        "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
        "channelTitle VARCHAR(100)"
    ")")
    self.db.commit()

  def recent(self, n=10):
    self.refresh()
    sql = "SELECT * FROM videos ORDER BY %s DESC"
    self.cursor.execute(sql, ('created', ))
    result = self.cursor.fetchall()
    result.reverse()
    return result[:n]

  def top(self, n=10):
    self.refresh()
    sql = "SELECT * FROM videos ORDER BY %s"
    self.cursor.execute(sql, ('polarity', ))
    result = self.cursor.fetchall()
    return result[-n:]

  def search(self, key):
    self.refresh()
    sql = "SELECT * FROM videos WHERE MATCH(title) AGAINST(%s)"
    self.cursor.execute(sql, (key, ))
    result = self.cursor.fetchall()
    if len(result) == 0:
      return None
    else:
      return result

  def video(self, videoId):
    self.refresh()
    sql = "SELECT * FROM videos WHERE id = %s"
    self.cursor.execute(sql, (videoId, ))
    # tuple
    result = self.cursor.fetchall()
    if len(result) == 0:
      return None
    else:
      return result[0]

  def comments(self, videoId, n=10):
    self.refresh()
    sql = "SELECT * FROM comments WHERE videoId = %s"
    self.cursor.execute(sql, (videoId, ))
    result = self.cursor.fetchall()
    return result[:n]

  def add_video(self, video_data):
    self.refresh()
    placeholders = ", ".join(['%s'] * len(video_data))
    columns = ", ".join(video_data.keys())
    sql = "INSERT INTO %s ( %s ) VALUES ( %s )" % ('videos', columns, placeholders)
    self.cursor.execute(sql, list(video_data.values()))
    self.db.commit()
    return "done"

  def add_comments(self, comment_data):
    self.refresh()
    c0 = comment_data[0]
    placeholders = ", ".join(['%s'] * len(c0))
    columns = ", ".join(c0.keys())
    sql = "INSERT INTO %s ( %s ) VALUES ( %s )" % ('comments', columns, placeholders)
    for c in comment_data:
        self.cursor.execute(sql, list(c.values()))
    self.db.commit()

# -----------------------------------------------------
#                   DATABASE SETUP
# -----------------------------------------------------
# def setup():
#   self.cursor.execute("CREATE DATABASE youtube_comments")
#   self.cursor.execute("CREATE TABLE comments ( "
#       "id VARCHAR(255), "
#       "level INT(6), "
#       "videoID VARCHAR(60), "
#       "channelId VARCHAR(60), "
#       "channelTitle VARCHAR(60), "
#       "textDisplay VARCHAR(1000), "
#       "authorDisplayName VARCHAR(255), "
#       "likedCount SMALLINT(255) UNSIGNED, "
#       "publishedAt VARCHAR(255), "
#       "polarity FLOAT(24), "
#       "subjectivity FLOAT(24), "
#       "status VARCHAR(10),"
#       "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
#   ")")
#   self.db.commit()

#   self.cursor.execute("CREATE TABLE videos ( "
#       "id VARCHAR(255), "
#       "title VARCHAR(300), "
#       "channelId VARCHAR(100), "
#       "thumbnail VARCHAR(50), "
#       "views INTEGER(15), "
#       "likes INTEGER(10), "
#       "dislikes INTEGER(10), "
#       "comments INTEGER(10), "
#       "polarity FLOAT(24), "
#       "subjectivity FLOAT(24), "
#       "positive FLOAT(24), "
#       "neutral FLOAT(24), "
#       "negative FLOAT(24), "
#       "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
#   ")")
#   self.db.commit()


