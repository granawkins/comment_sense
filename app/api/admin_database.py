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
