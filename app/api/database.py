import mysql.connector
import json
from get_docker_secret import get_docker_secret

class Database():

# SETUP

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

    self.createChannelsTable()
    self.channel_fields = [
      "id", "title", "thumbnail", "created", "total_videos", "db_videos",
      "last_scan", "next_page_token", "db_comments", "topics", "labels", "last_refresh",
      "subs_list", "labels_list", "ignore_list"]
    self.channel_json_fields = ['topics', 'labels', 'subs_list', 'labels_list', 'ignore_list']

    self.createVideosTable()
    self.video_fields = [
      "id", "title", "thumbnail", "channel_id", "published", "created", "total_comments",
      "db_comments", "next_page_token", "last_scan", "topics", "labels", "last_refresh"]
    self.video_json_fields = ['topics', "labels", 'next_page_token']

    self.createCommentsTable()
    self.comment_fields = [
        "id", "video_id", "channel_id", "author", "published", "created",
        "text", "likes", "parent", "n_children", "last_scan", "topics",
        "sentiment", "last_refresh"]
    self.comment_json_fields = ['topics']


  def refresh(self):
    if not self.db.is_connected:
      self.db = mysql.connector.connect(
        host="localhost" if self.env == 'desktop' else 'db',
        user="root",
        password='CaseyNeistat' if self.env == 'desktop' else self.pw,
        database=self.name,
      )
      self.cursor = self.db.cursor(dictionary=True)

# CHANNELS

  def createChannelsTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS channels ( "
      "id VARCHAR(32) NOT NULL, "
      "title VARCHAR(32) NOT NULL, "
      "thumbnail VARCHAR(128) NOT NULL, "
      "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "

      # Updated with app/scan_videos()
      "total_videos INT, "
      "db_videos INT, "
      "last_scan VARCHAR(32), "
      "next_page_token VARCHAR(32), "

      # Updated with app/refresh_channel()
      "db_comments INT, "
      "topics JSON, "
      "labels JSON, "
      "last_refresh VARCHAR(32), "

      # TODO
      "subs_list JSON, "
      "labels_list JSON, "
      "ignore_list JSON, "

      "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()


  def set_channel(self, id, user_data):
    """Create or update a channel record

    If channel doesn't exist, add it with the data provided.
    If channel does exist, update with data provided.
    """
    # Validate input fields
    data = {}
    for field in user_data:
      if field in self.channel_json_fields:
        data[field] = json.dumps(user_data[field])
      elif field in self.channel_fields:
        data[field] = user_data[field]
    if len(data) < 1:
      raise NameError(f"No usable data provided to set {id}")

    # Check if record exists
    try:
      self.refresh()
      self.cursor.execute("SELECT * FROM channels WHERE id = %s", (id, ))
      current = self.cursor.fetchall()
    except Exception as e:
      raise RuntimeError(f"Error fetching channel data from database.")

    # Add new record
    if len(current) == 0:
      data['db_videos'] = 0
      data['db_comments'] = 0
      if 'id' not in data:
        data['id'] = id
      placeholders = ", ".join(['%s'] * len(data))
      columns = ", ".join(data.keys())
      sql = "INSERT INTO channels ( %s ) VALUES ( %s )" % (columns, placeholders)
      try:
        self.cursor.execute(sql, list(data.values()))
        self.db.commit()
        return {'status': 'Added new channel to database'}
      except Exception as e:
        raise RuntimeError(f"Error writing new channel data to database: {e}")

    # Update existing record
    elif len(current) == 1:
      sql = "UPDATE channels SET "
      args = []
      for field in data:
        if (data[field] == None) or (data[field] == 'null'):
          sql += f"{field} = NULL, "
        else:
          sql += f"{field} = %s, "
          args.append(data[field])
      sql = sql[:-2]
      sql += " WHERE id = %s"
      try:
        injected = list(args) + [id] if len(args) > 0 else (id, )
        self.cursor.execute(sql, injected)
        self.db.commit()
        return {'status': 'Updated channel successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating channel data in database: {e}")


  def get_channel(self, id):
    """Return all channel data from database

    """
    self.refresh()
    try:
      self.cursor.execute("SELECT * FROM channels WHERE id = %s", (id, ))
      response = self.cursor.fetchall()
    except:
      raise RuntimeError(f"Error fetching channel data from database.")
    if len(response) == 0:
      return {'status': 'Channel not found'}
    else:
      channel = response[0]
      for field in channel:
        if channel[field] == 'null':
          channel[field] = None
      for field in self.channel_json_fields:
        if field in channel and channel[field] is not None:
          channel[field] = json.loads(channel[field])
      return {'status': 'Fetched channel data successfully.', 'channel': channel}

# VIDEOS

  def createVideosTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS videos ( "
      "id VARCHAR(32) NOT NULL, "
      "title VARCHAR(300) NOT NULL, "
      "thumbnail VARCHAR(255) NOT NULL, "
      "channel_id VARCHAR(32) NOT NULL, "
      "published VARCHAR(32) NOT NULL, "
      "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "

      # Update on open video
      "total_comments BIGINT, "

      # Update on analyze
      "db_comments INT, "
      "next_page_token JSON, "
      "last_scan VARCHAR(32), "

      # Update on analyze and refresh
      "topics JSON, "
      "labels JSON, "
      "last_refresh VARCHAR(32), "

      "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()


  def set_video(self, id, user_data):
    """Create or update a video record

    If video doesn't exist, add it with the data provided.
    If video does exist, update with data provided.
    """
    # Validate input fields
    data = {}
    for field in user_data:
      if field in self.video_json_fields:
        data[field] = json.dumps(user_data[field])
      elif field in self.video_fields:
        data[field] = user_data[field]
    if len(data) < 1:
      raise NameError(f"No usable data provided to set {id}")

    # Check if record exists
    try:
      self.refresh()
      self.cursor.execute("SELECT * FROM videos WHERE id = %s", (id, ))
      current = self.cursor.fetchall()
    except Exception as e:
      raise RuntimeError(f"Error fetching video data from database.")

    # Add new record
    if len(current) == 0:
      data['db_comments'] = 0
      if 'id' not in data:
        data['id'] = id
      placeholders = ", ".join(['%s'] * len(data))
      columns = ", ".join(data.keys())
      sql = "INSERT INTO videos ( %s ) VALUES ( %s )" % (columns, placeholders)
      try:
        self.cursor.execute(sql, list(data.values()))
        self.db.commit()
        return {'status': 'Added new video to database'}
      except Exception as e:
        raise RuntimeError(f"Error writing new video data to database: {e}")

    # Update existing record
    elif len(current) == 1:
      sql = "UPDATE videos SET "
      args = []
      for field in data:
        if (data[field] == None) or (data[field] == 'null'):
          sql += f"{field} = NULL, "
        else:
          sql += f"{field} = %s, "
          args.append(data[field])
      sql = sql[:-2]
      sql += " WHERE id = %s"
      try:
        injected = list(args) + [id] if len(args) > 0 else (id, )
        self.cursor.execute(sql, injected)
        self.db.commit()
        return {'status': 'Updated video successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating video data in database: {e}")


  def get_video(self, id):
    """Return all video data from database

    """
    self.refresh()
    try:
      self.cursor.execute("SELECT * FROM videos WHERE id = %s", (id, ))
      response = self.cursor.fetchall()
    except:
      raise RuntimeError(f"Error fetching video data from database.")
    if len(response) == 0:
      return {'status': 'Video not found'}
    else:
      video = response[0]
      for field in video:
        if video[field] == 'null':
          video[field] = None
      for field in self.video_json_fields:
        if field in video and video[field] is not None:
          video[field] = json.loads(video[field])
      return {'status': 'Fetched video data successfully.', 'video': video}


  def get_videos(self, channel_id, search=None, sort=None,
                 n=10, page=1, all=False, all_data=False):

    args = []
    if all_data:
      sql = "SELECT * FROM videos"
    else:
      sql = "SELECT id, title, thumbnail, published, db_comments FROM videos"

    sql += " WHERE channel_id = %s"
    args.append(channel_id)
    if search:
      sql += " AND title LIKE CONCAT('%', %s, '%')"
      args.append(search)
    sql += " ORDER BY published DESC"

    try:
      self.refresh()
      self.cursor.execute(sql, list(args))
      result = self.cursor.fetchall()
    except Exception as e:
      raise RuntimeError(f"Error fetching videos list from database.")

    if sort == 'oldest':
      result.reverse()
    if sort == 'top':
      result = sorted(result, key=lambda v: v['db_comments'], reverse=True)

    if all:
      return {"videos": result}
    else:
      n = int(n)
      page = int(page)
      start = min(len(result), n * (page - 1))
      finish = min(len(result), start + n)
      return {'videos': result[start:finish]}

# COMMENTS

  def createCommentsTable(self):
    self.refresh()
    self.cursor.execute("CREATE TABLE IF NOT EXISTS comments ( "
        "id VARCHAR(255) NOT NULL, "
        "video_id VARCHAR(32) NOT NULL, "
        "channel_id VARCHAR(32) NOT NULL, "
        "author VARCHAR(32) NOT NULL, "
        "published VARCHAR(32) NOT NULL, "
        "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "

        "text VARCHAR(1024), "
        "likes INT UNSIGNED, "
        "parent VARCHAR(255) DEFAULT '', "
        "n_children INT, "
        "last_scan VARCHAR(32), "

        "topics JSON, "
        "sentiment FLOAT(4,3), "
        "last_refresh VARCHAR(32), "

        "PRIMARY KEY (`id`) "
    ")")
    self.db.commit()


  def set_comment(self, id, user_data):
    """Create or update a comment record

    If comment doesn't exist, add it with the data provided.
    If comment does exist, update with data provided.
    """
    # Validate input fields
    data = {}
    for field in user_data:
      if field in self.comment_json_fields:
        data[field] = json.dumps(user_data[field])
      elif field in self.comment_fields:
        data[field] = user_data[field]
    if len(data) < 1:
      raise NameError(f"No usable data provided to set comment {id}")

    # Check if record exists
    try:
      self.refresh()
      self.cursor.execute("SELECT * FROM comments WHERE id = %s", (id, ))
      current = self.cursor.fetchall()
    except Exception as e:
      raise RuntimeError(f"Error fetching comment data from database.")

    # Add new record
    if len(current) == 0:
      if 'id' not in data:
        data['id'] = id
      placeholders = ", ".join(['%s'] * len(data))
      columns = ", ".join(data.keys())
      sql = "INSERT INTO comments ( %s ) VALUES ( %s )" % (columns, placeholders)
      try:
        self.cursor.execute(sql, list(data.values()))
        self.db.commit()
        return {'status': 'Added new comment to database'}
      except Exception as e:
        raise RuntimeError(f"Error writing new comment data to database: {e}")

    # Update existing record
    elif len(current) == 1:
      sql = "UPDATE comments SET "
      args = []
      for field in data:
        if (data[field] == None) or (data[field] == 'null'):
          sql += f"{field} = NULL, "
        else:
          sql += f"{field} = %s, "
          args.append(data[field])
      sql = sql[:-2]
      sql += " WHERE id = %s"
      try:
        injected = list(args) + [id] if len(args) > 0 else (id, )
        self.cursor.execute(sql, injected)
        self.db.commit()
        return {'status': 'Updated comment successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating comment data in database: {e}")


  def get_comment(self, id):
    """Return all comment data from database

    """
    self.refresh()
    try:
      self.cursor.execute("SELECT * FROM comments WHERE id = %s", (id, ))
      response = self.cursor.fetchall()
    except:
      raise RuntimeError(f"Error fetching comment data from database.")
    if len(response) == 0:
      return {'status': 'comment not found'}
    else:
      comment = response[0]
      for field in self.comment_json_fields:
        if field in comment and comment[field] is not None:
          comment[field] = json.loads(comment[field])
      for field in comment:
        if comment[field] == 'null':
          comment[field] = None
      return {'status': 'Fetched comment data successfully.', 'comment': comment}


  def get_comments(self, channel_id=None, video_id=None, comment_ids=[],
                   search=None, sort=None, n=10, page=1, all=False):

    # For each comment, there is json loading and null-None switching needed.
    # For those than use the get_comment, this is done already and shouldn't be duplicated.
    converted = False

    # Prioritize the most specific ID
    if len(comment_ids) > 1:
      converted = True
      result = []
      for id in comment_ids:
        db_comment = self.get_comment(id)
        result.append(db_comment['comment'])
    else:
      sql = "SELECT * FROM COMMENTS"
      args = []
      if video_id:
        sql += ' WHERE video_id = %s'
        args.append(video_id)
      else:
        sql += ' WHERE channel_id = %s'
        args.append(channel_id)

      if search:
        sql += " AND text LIKE CONCAT('%', %s, '%')"
        args.append(search)
      sql += " ORDER BY published DESC"

      try:
        self.refresh()
        self.cursor.execute(sql, args)
        result = self.cursor.fetchall()
      except Exception as e:
        raise RuntimeError(f"Error fetching comments from database: {e}")

    if sort == 'oldest':
      result.reverse()
    if sort == 'top':
      result = sorted(result, key=lambda v: v['likes'], reverse=True)

    if not all:
      n = int(n)
      page = int(page)
      start = min(len(result), n * (page - 1))
      finish = min(len(result), start + n)
      result = result[start:finish]

    if not converted:
      for comment in result:
        for field in self.comment_json_fields:
          if field in comment and comment[field] is not None:
            comment[field] = json.loads(comment[field])
        for field in comment:
          if comment[field] == 'null':
            comment[field] = None

    return {'comments': result}


# TOPICS

  def get_topics(self, channel_id, video_id=None, search=None, labels=None,
                 sort=None, n=10, page=1, all=False):
    if video_id:
      sql = 'SELECT topics FROM videos WHERE id = %s'
      ref = video_id
    else:
      sql = "SELECT topics FROM channels WHERE id = %s"
      ref = channel_id

    try:
      self.cursor.execute(sql, (ref, ))
      result = self.cursor.fetchall()
      topics = json.loads(result[0]['topics'])
    except Exception as e:
      raise RuntimeError(f"Error fetching topics from database.")

    if not topics:
      return {'error': "No topics found"}

    if search:
      def search_topic(topic):
        if search.lower() in topic['token'].lower():
          return True
        for tok in topic['toks']:
          if search.lower() in tok.lower():
            return True
        return False
      topics = list(filter(search_topic, topics))

    if labels:
      active_labels = [key for key, value in labels.items() if value]
      if len(active_labels) > 0:
        def has_label(topic):
          for label in topic['label']:
            if label in active_labels:
              return True
          return False
        topics = list(filter(has_label, topics))

    if not all:
      n = int(n)
      page = int(page)
      start = min(len(topics), n * (page - 1))
      finish = min(len(topics), start + n)
      topics = topics[start:finish]

    return {'topics': topics}
