import mysql.connector
import json
from get_docker_secret import get_docker_secret

class Database():

  def refresh(self):
    if not self.db.is_connected:
      self.db = mysql.connector.connect(
        host="localhost" if self.env == 'desktop' else 'db',
        user="root",
        password='CaseyNeistat' if self.env == 'desktop' else self.pw,
        database=self.name,
      )
      self.cursor = self.db.cursor(dictionary=True)

  def __init__(self, env='desktop', name="comment_sense"):
    self.name = name
    self.env = env
    if self.env == 'docker':
      self.pw = get_docker_secret('db-password', default='password')

    self.db = mysql.connector.connect(
      host="localhost" if self.env == 'desktop' else 'db',
      user="root",
      password='CaseyNeistat' if self.env == 'desktop' else self.pw,
    )
    self.cursor = self.db.cursor(dictionary=True)

    # Setup Database
    self.cursor.execute(f"CREATE DATABASE IF NOT EXISTS {name}")
    self.cursor.execute(f"USE {name}")
    self.createVideosTable()
    self.createCommentsTable()
    self.createTopicsTable()

  def createVideosTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS videos ( "
      "id VARCHAR(32) NOT NULL, "
      "title VARCHAR(300), "
      "thumbnail VARCHAR(50), "
      "channelId VARCHAR(32), "
      "channelTitle VARCHAR(32), "
      "published VARCHAR(32), "
      "topics JSON, "
      "n_analyzed INT, "
      "next_page_token JSON, "
      "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
      "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()

  def createCommentsTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS comments ( "
        "id VARCHAR(16) NOT NULL, "
        "videoId VARCHAR(32) NOT NULL, "
        "author VARCHAR(32), "
        "text VARCHAR(1024), "
        "likes INT UNSIGNED, "
        "published VARCHAR(32), "
        "parent VARCHAR(16) DEFAULT '', "
        "n_children INT, "
        "topics JSON, "
        "sentiment FLOAT(4,3), "
        "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
        "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()

  def createTopicsTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS topics ( "
      "id VARCHAR(32) NOT NULL, "
      "token VARCHAR(64) NOT NULL, "
      "label VARCHAR(16), "
      "subs JSON, "
      "videoIds VARCHAR(32) NOT NULL, "
      "n_comments INT, "
      "likes INT, "
      "sentiment FLOAT(4, 3), "
      "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
      "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()

  def add_video(self, video_data, overwrite=True):
    self.refresh()
    try:
      self.cursor.execute("SELECT * FROM videos WHERE id = %s", (video_data['id'], ))
      current = self.cursor.fetchall()

      for field in ['views', 'likes', 'dislikes', 'comments']:
        if field in video_data.keys():
          del video_data[field]

      # Add new record
      if len(current) == 0:
        if not 'topics' in video_data.keys():
          video_data['topics'] = []
          video_data['n_analyzed'] = 0
        placeholders = ", ".join(['%s'] * len(video_data))
        columns = ", ".join(video_data.keys())
        sql = "INSERT INTO videos ( %s ) VALUES ( %s )" % (columns, placeholders)
        self.cursor.execute(sql, list(video_data.values()))
        self.db.commit()

      # Update existing
      elif (video_data['n_analyzed'] != current[0]['n_analyzed']) & (overwrite == True):
        sql = "UPDATE videos SET topics = %s, n_analyzed = %s WHERE id = %s"
        self.cursor.execute(sql,  (video_data['topics'], video_data['n_analyzed'], video_data['id']))
        self.db.commit()

    except mysql.connector.Error as err:
      print("Error adding video: {}".format(err))

  def has_comment(self, commentId):
    self.refresh()
    self.cursor.execute("SELECT * FROM comments WHERE id = %s", (commentId, ))
    current = self.cursor.fetchall()
    return (len(current) > 0)

  def add_comment(self, c):
    if not self.has_comment(c['id']):
      self.refresh()
      placeholders = ", ".join(['%s'] * len(c))
      columns = ", ".join(c.keys())
      sql = "INSERT INTO comments ( %s ) VALUES ( %s )" % (columns, placeholders)
      self.cursor.execute(sql, list(c.values()))
      self.db.commit()

  def update_comment(self, c):
    self.refresh()
    self.cursor.execute("SELECT * FROM comments WHERE id = %s", (c['id'], ))
    current = self.cursor.fetchall()
    likes = c['likes'] if c['likes'] else current[0]['likes']
    if 'n_children' in c.keys():
      n_children = n_children = c['n_children']
    elif 'n_children' in current[0].keys():
      n_children = current[0]['n_children']
    else:
      n_children = 0
    sql = "UPDATE comments SET likes = %s, n_children = %s WHERE id = %s"
    self.cursor.execute(sql, (likes, n_children, c['id']))
    self.db.commit()

  def comment_topics(self, videoId):
    self.refresh()
    sql = "SELECT id, likes, sentiment, topics FROM comments WHERE videoId = %s"
    self.cursor.execute(sql, (videoId, ))
    results = self.cursor.fetchall()
    if len(results) == 0:
      return []
    else:
      return results

  def add_topics(self, topics_data, overwrite=True):
    self.refresh()
    try:
      for topic in topics_data:
        self.cursor.execute("SELECT * FROM topics WHERE id = %s", (topic['id'], ))
        current = self.cursor.fetchall()

        # Add new record
        if len(current) == 0:
          placeholders = ", ".join(['%s'] * len(topic))
          columns = ", ".join(topic.keys())
          sql = "INSERT INTO videos ( %s ) VALUES ( %s )" % (columns, placeholders)
          self.cursor.execute(sql, list(topic.values()))
          self.db.commit()

        # Update existing
        elif overwrite == True:
          new_subs = list(set((current['subs'] + topic['subs'])))
          new_n_comments = current['n_comments'] + topic['n_comments']
          new_likes = current['likes'] + topic['likes']
          new_sentiment = []
          for s in topic['sentiment']:
            new_sentiment.append(current['sentiment'][s] + topic['sentiment'][s])
          sql = "UPDATE topics SET subs = %s, n_comments = %s, likes = %s, sentiment = %s WHERE id = %s"
          self.cursor.execute(sql, (new_subs, new_n_comments, new_likes, new_sentiment, topic['id']))
    except mysql.connector.Error as err:
      print("Error adding topic: {}".format(err))

  def recent(self, n=10, page=1):
    self.refresh()
    # Doesn't accept datetime object, so have to exclude created.
    self.cursor.execute("SELECT id, title, thumbnail, channelTitle, published FROM videos ORDER BY created DESC")
    result = self.cursor.fetchall()
    result.reverse()
    start = min(len(result), int(n) * (int(page) - 1))
    finish = min(len(result), start + int(n))
    return result[start:finish]

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

  def topics(self, videoId, n=20, page=1):
    video_data = self.video(videoId)
    if not video_data:
      return None
    if 'topics' not in video_data.keys():
      return None
    topics = json.loads(video_data['topics'])
    start = min(len(topics), int(n) * (int(page) - 1))
    finish = min(len(topics), start + int(n))
    return json.dumps(topics[start:finish])

  def n_analyzed(self, videoId):
    sql = "SELECT n_analyzed FROM videos WHERE id = %s"
    self.cursor.execute(sql, (videoId, ))
    result = self.cursor.fetchall()
    if len(result) == 0:
      return 0
    else:
      return result[0]

  def numComments(self, videoId):
    self.refresh()
    sql = "SELECT COUNT(*) FROM comments WHERE videoId = %s"
    self.cursor.execute(sql, (videoId, ))
    n = int(self.cursor.fetchall()[0]["COUNT(*)"])
    return n

  def comments(self, comment_ids, n=10):
    self.refresh()
    comments_data = []
    print(comment_ids[0])
    # parsed_ids = json.loads(comment_ids)
    for c in comment_ids:
      sql = "SELECT id, text, author, likes, sentiment, topics, published FROM comments WHERE id = %s"
      self.cursor.execute(sql, (c, ))
      results = self.cursor.fetchall()
      if len(results) > 0:
        comments_data.append(results[0])
    return comments_data

  def all_comments(self, videoId):
    self.refresh()
    sql = "SELECT id, text, author, likes, sentiment, topics, published FROM comments WHERE videoId = %s"
    self.cursor.execute(sql, (videoId, ))
    results = self.cursor.fetchall()
    return results
