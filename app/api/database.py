import mysql.connector
from mysql.connector import pooling
import json
from get_docker_secret import get_docker_secret

class Database():

# SETUP

  def __init__(self, env='desktop', name="comment_sense"):
    self.name = name
    self.env = env
    if self.env == 'docker':
      self.pw = get_docker_secret('db-password', default='password')

    # Setup a temporary connection to build the table
    cnx = mysql.connector.connect(
      host="localhost" if self.env == 'desktop' else 'db',
      user="root",
      password='CaseyNeistat' if self.env == 'desktop' else self.pw,
    )
    cursor = cnx.cursor(dictionary=True)
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.name}")
    cursor.execute(f"USE {self.name}")
    cursor.close()
    cnx.close()

    # Setup Pooling
    # ref: https://pynative.com/python-database-connection-pooling-with-mysql/
    self.connection_pool = pooling.MySQLConnectionPool(
      pool_name="cs_pool",
      pool_size=8,
      pool_reset_session=True,
      host="localhost" if self.env == 'desktop' else 'db',
      database=name,
      user="root",
      password='CaseyNeistat' if self.env == 'desktop' else self.pw)

    self.build_database()

  # Get a new pooled connection to the database. This primarily used by Flask
  # in app.py to execute a single API call.
  def get_cnx(self):
    connection_object = self.connection_pool.get_connection()
    cursor = connection_object.cursor(dictionary=True)
    return connection_object, cursor

  def close(self, cnx, cursor):
    cnx.close()
    cursor.close()

  def build_database(self):
    cnx, cursor = self.get_cnx()

    self.createUsersTable(cnx, cursor)
    self.user_fields =   ["id", "email", "email_verified", "nickname", "picture", "channel_id",
                          "quota", "sentiment_on", "created"]
    self.user_json_fields = []

    self.createChannelsTable(cnx, cursor)
    self.channel_fields = [
      "id", "title", "thumbnail", "created", "total_videos", "db_videos",
      "last_scan", "next_page_token", "db_comments", "topics", "labels", "last_refresh",
      "subs_list", "labels_list", "ignore_list"]
    self.channel_json_fields = ['topics', 'labels', 'subs_list', 'labels_list', 'ignore_list']

    self.createVideosTable(cnx, cursor)
    self.video_fields = [
      "id", "title", "thumbnail", "channel_id", "published", "created", "total_comments",
      "db_comments", "next_page_token", "last_scan", "topics", "labels", "last_refresh"]
    self.video_json_fields = ['topics', "labels", 'next_page_token']

    self.createCommentsTable(cnx, cursor)
    self.comment_fields = [
        "id", "video_id", "channel_id", "author", "published", "created",
        "text", "likes", "parent", "n_children", "last_scan", "topics",
        "sentiment", "last_refresh"]
    self.comment_json_fields = ['topics']

    self.createWaitlistTable(cnx, cursor)
    self.waitlist_fields = ['email', 'created']
    self.close(cnx, cursor)


# USERS

  def createUsersTable(self, cnx=None, cursor=None):
    cursor.execute("CREATE TABLE IF NOT EXISTS users ( "
      "id VARCHAR(255) NOT NULL, "
      "email VARCHAR(255), "
      "email_verified BOOLEAN, "
      "nickname VARCHAR(255), "
      "picture VARCHAR(255), "
      "channel_id VARCHAR(255), "
      "quota BIGINT, "
      "sentiment_on BOOLEAN, "
      "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
      "PRIMARY KEY (`id`) "
    ")")
    cnx.commit()

  def set_user(self, cnx, cursor, id, user_data):
    """Create or update a user record

    If user doesn't exist, add it with the data provided.
    If user does exist, update with data provided.
    """
    # Validate input fields
    data = {}
    for field in user_data:
      if field in self.user_json_fields:
        data[field] = json.dumps(user_data[field])
      elif field in self.user_fields:
        data[field] = user_data[field]
    if len(data) < 1:
      raise NameError(f"No usable data provided to set {id}")

    # Check if record exists
    try:
      cursor.execute("SELECT * FROM users WHERE id = %s", (id, ))
      current = cursor.fetchall()
    except Exception as e:
      raise RuntimeError(f"Error fetching user data from database.")

    # Add new record
    if len(current) == 0:
      required_fields = ['id', 'email', 'email_verified']
      for field in required_fields:
        if field not in data.keys():
          raise RuntimeError(f"User is missing a required field")

      placeholders = ", ".join(['%s'] * len(data))
      columns = ", ".join(data.keys())
      sql = "INSERT INTO users ( %s ) VALUES ( %s )" % (columns, placeholders)
      try:
        cursor.execute(sql, list(data.values()))
        cnx.commit()
        return {'status': 'Added new user to database'}
      except Exception as e:
        raise RuntimeError(f"Error writing new user data to database: {e}")

    # Update existing record
    elif len(current) == 1:
      sql = "UPDATE users SET "
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
        cursor.execute(sql, injected)
        cnx.commit()
        return {'status': 'Updated user successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating user data in database: {e}")


  def get_user(self, cnx, cursor, id, by_username=False):
    """Return all user data from database

    """
    try:
      if by_username:
        cursor.execute("SELECT * FROM users WHERE username = %s", (id, ))
        response = cursor.fetchall()
      else:
        cursor.execute("SELECT * FROM users WHERE id = %s", (id, ))
        response = cursor.fetchall()
    except:
      raise RuntimeError(f"Error fetching user data from database.")
    if len(response) == 0:
      return {'status': 'User not found'}
    else:
      user = response[0]
      for field in user:
        if user[field] == 'null':
          user[field] = None
      for field in self.user_json_fields:
        if field in user and user[field] is not None:
          user[field] = json.loads(user[field])
      return {'status': 'Fetched user data successfully.', 'user': user}


  def get_users(self, cnx, cursor):

    try:
      cursor.execute("SELECT * FROM users")
      response = cursor.fetchall()
    except:
      raise RuntimeError(f"Error fetching users from database.")

    fields = ['id', 'username', 'email', 'email_verified', 'quota',
              'sentiment_on', 'channel_id']
    users = []
    for item in response:
      user = item.copy()
      for field in item:
        if field not in fields:
          del user[field]
        else:
          if item[field] == 'null':
            user[field] = None
          if field in self.user_json_fields and user[field] is not None:
            user[field] = json.loads(item[field])
      users.append(user)
    return {'users': users}

# CHANNELS

  def createChannelsTable(self, cnx, cursor):
    cursor.execute("CREATE TABLE IF NOT EXISTS channels ( "
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
    cnx.commit()


  def set_channel(self, cnx, cursor, id, user_data):
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
      cursor.execute("SELECT * FROM channels WHERE id = %s", (id, ))
      current = cursor.fetchall()
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
        cursor.execute(sql, list(data.values()))
        cnx.commit()
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
        cursor.execute(sql, injected)
        cnx.commit()
        return {'status': 'Updated channel successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating channel data in database: {e}")


  def get_channel(self, cnx, cursor, id):
    """Return all channel data from database

    """
    try:
      cursor.execute("SELECT * FROM channels WHERE id = %s", (id, ))
      response = cursor.fetchall()
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

  def createVideosTable(self, cnx, cursor):
    cursor.execute("CREATE TABLE IF NOT EXISTS videos ( "
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
    cnx.commit()


  def set_video(self, cnx, cursor, id, user_data):
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
      cursor.execute("SELECT * FROM videos WHERE id = %s", (id, ))
      current = cursor.fetchall()
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
        cursor.execute(sql, list(data.values()))
        cnx.commit()
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
        cursor.execute(sql, injected)
        cnx.commit()
        return {'status': 'Updated video successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating video data in database: {e}")


  def get_video(self, cnx, cursor, id):
    """Return all video data from database

    """
    try:
      cursor.execute("SELECT * FROM videos WHERE id = %s", (id, ))
      response = cursor.fetchall()
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


  def get_videos(self, cnx, cursor, channel_id, search=None, sort=None,
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
      cursor.execute(sql, list(args))
      result = cursor.fetchall()
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

  def createCommentsTable(self, cnx, cursor):
    cursor.execute("CREATE TABLE IF NOT EXISTS comments ( "
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
    cnx.commit()


  def set_comment(self, cnx, cursor, id, user_data):
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
      cursor.execute("SELECT * FROM comments WHERE id = %s", (id, ))
      current = cursor.fetchall()
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
        cursor.execute(sql, list(data.values()))
        cnx.commit()
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
        cursor.execute(sql, injected)
        cnx.commit()
        return {'status': 'Updated comment successfully.'}
      except Exception as e:
        raise RuntimeError(f"Error updating comment data in database: {e}")


  def get_comment(self, cnx, cursor, id, search=None):
    """Return all comment data from database

    """
    try:
      if search:
        cursor.execute("SELECT * FROM comments WHERE id = %s AND text LIKE CONCAT('%', %s, '%')", (id, search, ))
      else:
        cursor.execute("SELECT * FROM comments WHERE id = %s", (id, ))
      response = cursor.fetchall()
    except:
      raise RuntimeError(f"Error fetching comment data from database.")
    if len(response) == 0:
      return {'status': 'comment not found', 'comment': None}
    else:
      comment = response[0]
      for field in self.comment_json_fields:
        if field in comment and comment[field] is not None:
          comment[field] = json.loads(comment[field])
      for field in comment:
        if comment[field] == 'null':
          comment[field] = None
      return {'status': 'Fetched comment data successfully.', 'comment': comment}


  def get_comments(self, cnx, cursor, channel_id=None, video_id=None, comment_ids=[], parent_id=None,
                   search=None, sort=None, n=10, page=1, all=False):

    # For each comment, there is json loading and null-None switching needed.
    # For those than use the get_comment, this is done already and shouldn't be duplicated.
    converted = False

    # Prioritize the most specific ID
    if len(comment_ids) > 0:
      converted = True
      result = []
      for id in comment_ids:
        db_comment = self.get_comment(cnx, cursor, id, search)
        if db_comment['comment']:
          result.append(db_comment['comment'])
    else:
      sql = "SELECT * FROM comments"
      args = []
      if parent_id:
        sql += " WHERE parent = %s"
        args.append(parent_id)
      elif video_id:
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
        cursor.execute(sql, args)
        result = cursor.fetchall()
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

  def get_topics(self, cnx, cursor, channel_id, video_id=None, search=None, labels=None,
                 sort=None, n=10, page=1, all=False):
    if video_id:
      sql = 'SELECT topics FROM videos WHERE id = %s'
      ref = video_id
    else:
      sql = "SELECT topics FROM channels WHERE id = %s"
      ref = channel_id

    try:
      cursor.execute(sql, (ref, ))
      result = cursor.fetchall()
    except Exception as e:
      raise RuntimeError(f"Error fetching topics from database.")
    if len(result) == 0:
      return {'status': "video not found", 'topics': []}
    if not result[0]['topics']:
      return {'status': 'no topics in video', 'topics': []}

    topics = json.loads(result[0]['topics'])

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
          if video_id:
            if topic['label'] in active_labels:
              return True
            else:
              return False
          else:
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

# WAITLIST

  def createWaitlistTable(self, cnx, cursor):
    cursor.execute("CREATE TABLE IF NOT EXISTS waitlist ( "
      "email VARCHAR(255) NOT NULL, "
      "created TIMESTAMP DEFAULT CURRENT_TIMESTAMP "
    ")")
    cnx.commit()

  def set_waitlist(self, cnx, cursor, email):
    db_list = self.get_waitlist(cnx, cursor)
    waitlist = db_list['waitlist']
    for item in waitlist:
      if item['email'] == email:
        return {'error': f"{email} is already on waitlist"}
    try:
      cursor.execute("INSERT INTO waitlist ( email ) VALUES ( %s )", (email, ))
      cnx.commit()
      return {'status': 'Added new email to waitlist'}
    except Exception as e:
      raise RuntimeError(f"Error writing new email to database: {e}")

  def get_waitlist(self, cnx, cursor):

    cursor.execute("SELECT * FROM waitlist")
    response = cursor.fetchall()
    return {'waitlist': response}
