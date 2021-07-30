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
    self.createChannelsTable()
    # self.createBlogTable()
    # self.createFeedbackTable()


  def createChannelsTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS channels ( "
      "id VARCHAR(32) NOT NULL, "
      "channel_title VARCHAR(32), "
      "thumbnail VARCHAR(128), "
      "views BIGINT(32), "
      "subscribers BIGINT(16), "
      "n_total INT(8), "
      "videos JSON, "
      "next_page_token VARCHAR(32), "
      "last_scanned VARCHAR(32), "
      "topics JSON, "
      "joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
      "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()


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


  def add_channel(self, channel_data, overwrite=True):
    self.refresh()
    try:
      self.cursor.execute("SELECT * FROM channels WHERE id = %s", (channel_data['id'], ))
      current = self.cursor.fetchall()

      # Add new record
      if len(current) == 0:
        for section in ['videos', 'topics']:
          channel_data[section] = json.dumps(channel_data[section])
        placeholders = ", ".join(['%s'] * len(channel_data))
        columns = ", ".join(channel_data.keys())
        sql = "INSERT INTO channels ( %s ) VALUES ( %s )" % (columns, placeholders)
        self.cursor.execute(sql, list(channel_data.values()))
        self.db.commit()

      # Update existing record
      else:
        old_channel = current[0]
        if len(old_channel['videos']) != len(channel_data['videos']):
          sql = """UPDATE channels SET n_total = %s, videos = %s, next_page_token = %s,
                   last_scanned = %s WHERE id = %s"""
          self.cursor.execute(sql, (channel_data['n_total'], channel_data['videos'],
                                    channel_data['next_page_token'], channel_data['last_scanned'],
                                    channel_data['id']))
          self.db.commit()

    except mysql.connector.Error as err:
      print("Error adding channel: {}".format(err))


  def channel(self, channelId):
    self.refresh()
    self.cursor.execute("SELECT * FROM channels WHERE id = %s", (channelId, ))
    response = self.cursor.fetchall()
    if len(response) == 0:
      return {'error': 'Channel not found'}
    else:
      channel = response[0]
      for section in ['videos', 'topics']:
        channel[section] = json.loads(channel[section])
      return {'channel': channel}


  def add_video(self, video_data, overwrite=True):
    self.refresh()
    try:
      self.cursor.execute("SELECT * FROM videos WHERE id = %s", (video_data['id'], ))
      current = self.cursor.fetchall()

      # Add new record
      if len(current) == 0:
        if 'topics' not in video_data.keys():
          video_data['topics'] = json.dumps([])
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


  def video(self, videoId):
    self.refresh()
    sql = "SELECT * FROM videos WHERE id = %s"
    result = None
    try:
      self.cursor.execute(sql, (videoId, ))
      results = self.cursor.fetchall()
      if len(results) > 0:
        result = results[0]
    finally:
      return result


  def videos(self, channelId, search, sort, n=10, page=1):
    if search:
      print(f'searching for {channelId} videos with {search} in title')
      sql = """SELECT id, title, thumbnail, published, n_analyzed
               FROM videos
               WHERE channelId = %s AND title LIKE CONCAT('%', %s, '%')
            """
      args = (channelId, search, )
    else:
      sql = """SELECT id, title, thumbnail, published, n_analyzed
               FROM videos
               WHERE channelId = %s
               ORDER BY published DESC"""
      args = (channelId, )
    self.cursor.execute(sql, args)
    result = self.cursor.fetchall()
    start = min(len(result), int(n) * (int(page) - 1))
    finish = min(len(result), start + int(n))
    return {'videos': result[start:finish]}


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


  def topics(self, channelId, videoId=None, search=None, sort=None, n=10, page=1):
    if videoId:
      sql = 'SELECT topics FROM videos WHERE id = %s'
      ref = videoId
    else:
      sql = "SELECT id, topics FROM videos WHERE channelId = %s"
      ref = channelId
    self.cursor.execute(sql, (ref, ))
    result = self.cursor.fetchall()
    return {'videos': result}


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


  def comments(self, comment_ids, n=10):
    self.refresh()
    comments_data = []
    # parsed_ids = json.loads(comment_ids)
    for c in comment_ids:
      sql = "SELECT id, text, author, likes, sentiment, topics, published FROM comments WHERE id = %s"
      self.cursor.execute(sql, (c, ))
      results = self.cursor.fetchall()
      if len(results) > 0:
        comments_data.append(results[0])
    return comments_data


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


  def all_comments(self, videoId):
    self.refresh()
    sql = "SELECT id, text, author, likes, sentiment, topics, published FROM comments WHERE videoId = %s"
    self.cursor.execute(sql, (videoId, ))
    results = self.cursor.fetchall()
    return results


  # UNUSED

  # def recent(self, n=10, page=1):
  #   self.refresh()
  #   # Doesn't accept datetime object, so have to exclude created.
  #   self.cursor.execute("SELECT id, title, thumbnail, channelTitle, published, n_analyzed FROM videos ORDER BY created DESC")
  #   result = self.cursor.fetchall()
  #   start = min(len(result), int(n) * (int(page) - 1))
  #   finish = min(len(result), start + int(n))
  #   return result[start:finish]


  # def top(self, n=10, page=1):
  #   self.refresh()
  #   # Doesn't accept datetime object, so have to exclude created.
  #   self.cursor.execute("SELECT id, title, thumbnail, channelTitle, published, n_analyzed FROM videos ORDER BY n_analyzed DESC")
  #   result = self.cursor.fetchall()
  #   start = min(len(result), int(n) * (int(page) - 1))
  #   finish = min(len(result), start + int(n))
  #   return result[start:finish]


# ADMIN

  # def createBlogTable(self):
  #   self.refresh()
  #   self.cursor.execute("CREATE TABLE IF NOT EXISTS blog ( "
  #     "id INT(6) NOT NULL, "
  #     "title VARCHAR(64), "
  #     "permalink VARCHAR(64), "
  #     "thumbnail JSON, "
  #     "excerpt VARCHAR(1000), "
  #     "content JSON, "
  #     "active BOOL, "
  #     "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
  #     "PRIMARY KEY (`id`) "
  #   ")")
  #   self.db.commit()

  # def createFeedbackTable(self):
  #   self.refresh()
  #   self.cursor.execute("CREATE TABLE IF NOT EXISTS feedback ( "
  #     "id INT NOT NULL AUTO_INCREMENT, "
  #     "message JSON, "
  #     "email JSON, "
  #     "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
  #     "active BOOL, "
  #     'PRIMARY KEY (`id`) '
  #   ")")
  #   self.db.commit()


  # def add_blog_post(self, data):
  #   c = {
  #     'id': int(data['id']),
  #     'title': str(data['title']),
  #     'permalink': str(data['permalink']),
  #     'thumbnail': json.dumps(data['thumbnail']),
  #     'excerpt': str(data['excerpt']),
  #     'content': json.dumps(data['content']),
  #     'active': bool(data['active']),
  #   }
  #   self.cursor.execute("SELECT * FROM blog WHERE id = %s", (c['id'], ))
  #   current = self.cursor.fetchall()

  #   # Add new
  #   if len(current) == 0:
  #     self.refresh()
  #     placeholders = ", ".join(['%s'] * len(c))
  #     columns = ", ".join(c.keys())
  #     sql = "INSERT INTO blog ( %s ) VALUES ( %s )" % (columns, placeholders)
  #     self.cursor.execute(sql, list(c.values()))
  #     self.db.commit()

  #   # Update existing
  #   else:
  #     sql = "UPDATE blog SET title = %s, permalink = %s, thumbnail = %s, excerpt = %s, content = %s, active = %s WHERE id = %s"
  #     self.cursor.execute(sql, (c['title'], c['permalink'], c['thumbnail'], c['excerpt'], c['content'], c['active'], c['id']))
  #     self.db.commit()


  # def get_blog_posts(self):
  #   self.refresh()
  #   sql = "SELECT id, title, permalink, thumbnail, excerpt, content, active, created FROM blog"
  #   self.cursor.execute(sql)
  #   results = self.cursor.fetchall()
  #   for result in results:
  #     result['thumbnail'] = json.loads(result['thumbnail'])
  #     result['content'] = json.loads(result['content'])
  #   return results


  # def get_blog_post(self, data):
  #   if 'permalink' in data:
  #     sql = "SELECT id, title, permalink, thumbnail, excerpt, content, active, created FROM blog WHERE permalink = %s"
  #     self.cursor.execute(sql, (data['permalink'], ))
  #     results = self.cursor.fetchall()
  #     for result in results:
  #       result['thumbnail'] = json.loads(result['thumbnail'])
  #       result['content'] = json.loads(result['content'])
  #     return results[0]


  # def remove_blog_post(self, id):
  #   sql = "DELETE FROM blog WHERE id = %s"
  #   self.cursor.execute(sql, (id, ))

  # def add_feedback(self, data):
  #   c = {
  #     'email': json.dumps(data['email']),
  #     'message': json.dumps(data['message']),
  #     'active': True,
  #   }
  #   if ('id' in data):
  #     print('already have feedback of this id')
  #   else:
  #     self.refresh()
  #     placeholders = ", ".join(['%s'] * len(c))
  #     columns = ", ".join(c.keys())
  #     sql = "INSERT INTO feedback ( %s ) VALUES ( %s )" % (columns, placeholders)
  #     self.cursor.execute(sql, list(c.values()))
  #     self.db.commit()

  # def get_feedback(self):
  #   self.refresh()
  #   sql = "SELECT * FROM feedback"
  #   self.cursor.execute(sql)
  #   results = self.cursor.fetchall()
  #   for result in results:
  #     result['email'] = json.loads(result['email'])
  #     result['message'] = json.loads(result['message'])
  #   return results
