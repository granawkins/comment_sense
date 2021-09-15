import json, math, datetime
import logging
from flask import Flask, render_template, request, redirect, url_for
from youtube import YouTube
from database import Database
from analyzer import Analyzer
from clusterer import Clusterer, cluster, cluster_videos
import hashlib

# Initialize Logger
logger = logging.getLogger('cs_api')
logger.setLevel(logging.DEBUG)
# Set custom logger for all comment_sense calls
cs = logging.FileHandler('logs/cs_logs.log')
cs.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
cs.setFormatter(formatter)
logger.addHandler(cs)

env='docker'
db_name = 'comment_sense'

# env="desktop"
# db_name = 'cs_test_10'

app = Flask(__name__)
yt = YouTube()
db = Database(env, name=db_name)
an = Analyzer(env, db)

# USER

@app.route('/api/user', methods=['POST'])
def user():
    """Return user data, include channel data if exists
    """
    request_data = request.get_json()
    user_data = request_data['user']
    user_id = user_data['id']
    cnx, cursor = db.get_cnx()

    try:
        db_data = db.get_user(cnx, cursor, user_id)
    except Exception as e:
        db.close(cnx, cursor)
        return {'error': f'Error loading user from Database: {e}'}

    if 'user' not in db_data.keys():
        try:
            db.set_user(cnx, cursor, user_id, user_data)
        except Exception as e:
            db.close(cnx, cursor)
            return {'error': f"Error adding user to Database: {e}"}

        db_user = db.get_user(cnx, cursor, user_id)
    else:
        db_user = db_data['user']

    db.close(cnx, cursor)
    return {'user': db_user}


@app.route('/api/set_user', methods=['POST'])
def set_user():
    """Update a user record"""
    request_data = request.get_json()
    user_id = request_data['userId']
    user = request_data['user']

    try:
        cnx, cursor = db.get_cnx()
        db.set_user(cnx, cursor, user_id, user)
        db_data = db.get_user(cnx, cursor, user_id)
    except Exception as e:
        return {'error': f"Error updating user in Database: {e}"}
    finally:
        db.close(cnx, cursor)

    return {'user': db_data['user']}

@app.route('/api/get_users', methods=['POST'])
def get_users():
    request_data = request.get_json()
    try:
        cnx, cursor = db.get_cnx()
        response = db.get_users(cnx, cursor)
        users = response['users']
    except Exception as e:
        return {'error': f"Error fetching users: {e}"}
    finally:
        db.close(cnx, cursor)

    return {'users': users}

def spend_quota(cnx, cursor, user_id, amount, type):
    # Get the current quota
    db_user = db.get_user(cnx, cursor, user_id)
    if 'user' not in db_user.keys():
        return {'error': 'User not found'}
    old_quota = db_user['user']['quota']

    # Calculate new and check not negative
    def price(amount, type):
        if type == 'videos':
            return amount
        elif type == 'comments':
            return amount
        else:
            return 0
    cost = price(amount, type)
    new_quota = old_quota - cost
    if new_quota < 0:
        return {'error': 'Insufficient quota'}

    # Set the new quota
    try:
        response = db.set_user(cnx, cursor, user_id, {'quota': new_quota})
        if 'error' in response:
            return {'error': f'Error updating quota: {response["error"]}'}
        return {'status': 'Updated quota successfully'}
    except Exception as e:
        return {'error': f'Error updating user in db: {e}'}

# CHANNEL

@app.route('/api/get_channels', methods=['POST'])
def get_channels():
    # Take YT username from request
    request_data = request.get_json()
    if 'username' not in request_data.keys():
        return {'error': 'Must provide username'}
    username = request_data['username']

    # Get channels for username
    # channel={id, title, thumbnail, uploads_playlist}
    channels_data = yt.get_channels(username)
    channels = channels_data['channels']
    if len(channels) == 0:
        return {'error': 'No channels found for username'}

    # Get data for each channel
    all_data = []
    for channel in channels:
        channel_data = yt.channel(channel['id'])
        if 'channel' in channel_data.keys():
            all_data.append({
                **channel,
                'total_videos': channel_data['channel']['total_videos']
            })

    # Return list of channels w/ data
    return {'channels': all_data}

@app.route('/api/set_channel', methods=['POST'])
def set_channel():
    # Validate channel data
    request_data = request.get_json()
    user = request_data['user']
    user_id = user['id']
    channel = request_data['channel']
    for item in ['id', 'title', 'uploads_playlist', 'total_videos']:
        if item not in channel.keys():
            return {'error': f'Channel missing {item} field'}
    channel_id = channel['id']

    try:
        # Add the channel
        cnx, cursor = db.get_cnx()
        db.set_channel(cnx, cursor, channel_id, channel)
        # Update the user to include channelId
        db.set_user(cnx, cursor, user_id, {'channel_id': channel_id})
        return {'status': 'successfully set channel'}
    except Exception as e:
        return {'error': f'Error setting channel: {e}'}
    finally:
        db.close(cnx, cursor)

@app.route('/api/channel', methods=['POST'])
def channel():
    """Return channel data. If not in db, check for data and add to db. If not data, return none.

    """
    request_data = request.get_json()
    if 'channelId' not in request_data.keys():
        return {'error': 'No channel specified'}
    channel_id = request_data['channelId']

    # Try to get it from database.
    try:
        cnx, cursor = db.get_cnx()
        data = db.get_channel(cnx, cursor, channel_id)
    except Exception as e:
        return {'error': f'Error loading channel from Database: {e}'}
    finally:
        db.close(cnx, cursor)

    if 'channel' not in data.keys():
        return {'error': 'Channel not in database'}

    return {'channel': data['channel']}

# VIDEOS

@app.route('/api/refresh_videos', methods=['POST'])
def refresh_videos():
    """Return all videos from from a YouTube playlist.

    """
    # Parse the request
    request_data = request.get_json()
    user = request_data['user']
    user_id = user['id']
    channel_id = request_data['channelId']
    playlist_id = request_data['uploads_playlist']

    # Initialize database connection
    cnx, cursor = db.get_cnx()

    # Working variables
    db_videos = db.get_videos(cnx, cursor, channel_id, all=True)
    all_ids = [video['id'] for video in db_videos['videos']]
    total_videos = len(db_videos)
    total_scanned = 0
    new_ids = []
    end = False
    error = False
    max_retries = 3
    next_page_token = None

    while not end and not error and max_retries > 0:
        # Charge the user's quota for calling YT
        spend = spend_quota(cnx, cursor, user_id, 1, 'videos')
        if 'error' in spend.keys():
            error = spend['error']
            break
        logger.info(f"youtube_videos - {channel_id}")

        try:
            # Get the next page of results
            response = yt.get_playlist_page(
                playlist_id=playlist_id,
                next_page_token=next_page_token
            )
        except Exception as e:
            error = f"Error getting videos from YouTube: {e}"
            break

        # Parse response
        total_videos = response['total_videos']
        next_page_token = response['next_page_token']
        resp_videos = response['videos']

        if len(resp_videos) == 0:
            end = "No videos returned"
        else:
            total_scanned += len(resp_videos)
            # Don't consider videos that are already in database
            new_videos = [v for v in resp_videos if v['id'] not in all_ids]
            if len(new_videos) == 0:
                max_retries -= 1
            else:
                page_ids = [v['id'] for v in new_videos]
                all_ids.extend(page_ids)
                for video in new_videos:
                    video['channel_id'] = channel_id
                    db.set_video(cnx, cursor, video['id'], video)

            if len(all_ids) >= total_videos:
                end = "Reached target number of videos"

    # Update database entry
    timestamp = datetime.datetime.now()
    reset_channel = {
        'total_videos': total_videos,
        'last_scan': timestamp,
        'db_videos': len(all_ids)
    }
    db.set_channel(cnx, cursor, channel_id, reset_channel)

    refreshed_user = db.get_user(cnx, cursor, user_id)
    new_quota = refreshed_user['user']['quota']
    db.close(cnx, cursor)

    return {'db_videos': len(all_ids), 'total_videos': total_videos,
            'end': end, 'error': error, 'new_quota': new_quota, 'last_scan': timestamp}


@app.route('/api/videos', methods=['POST'])
def videos():
    request_data = request.get_json()
    args = {
        'channel_id': request_data['channelId'],
        'search': None if not 'search' in request_data else request_data['search'],
        'sort': None if not 'sort' in request_data else request_data['sort'],
    }
    if 'pageSize' in request_data:
        args['n'] = request_data['pageSize']
    if 'pageNumber' in request_data:
        args['page'] = request_data['pageNumber']
    if 'all' in request_data:
        args['all'] = request_data['all']
    logger.info(f"videos - {json.dumps(args)}")
    try:
        cnx, cursor = db.get_cnx()
        db_data = db.get_videos(cnx, cursor, **args)
    except Exception as e:
        return {'error': f"Error fetching videos from database: {e}"}
    finally:
        db.close(cnx, cursor)

    videos = db_data['videos']
    return {'items': videos}


@app.route('/api/video/<video_id>', methods=['GET'])
def video(video_id):
    logger.info(f"video - {video_id}")
    cnx, cursor = db.get_cnx()

    try:
        db_data = db.get_video(cnx, cursor, video_id)
        db_video = db_data['video']
    except Exception as e:
        db.close(cnx, cursor)
        return {'error': f"Error fetching video from db: {e}"}

    yt_video = yt.video(video_id)
    del yt_video['published'] # Prefer the format from the 'videos' function

    # This function will update the db fields which are timely and come from youtube
    video_data = {**db_video, **yt_video}
    db.set_video(cnx, cursor, video_id, video_data)
    db.close(cnx, cursor)

    del video_data['topics']
    return {'video_data': video_data}

# COMMENTS

@app.route('/api/comments', methods=['POST'])
def comments():
    request_data = request.get_json()
    args = {}

    # Requires a channelId, videoId, or list of commentIds.
    # The most specific ID (comment > video > channel) is used.
    if 'parentId' in request_data:
        args['parent_id'] = request_data['parentId']
    elif 'commentIds' in request_data:
        if len(request_data['commentIds']) > 0:
            args['comment_ids'] = request_data['commentIds']
    elif 'videoId' in request_data:
        args['video_id']  = request_data['videoId']
    elif 'channelId' in request_data:
        args['channel_id'] = request_data['channelId']
    if len(args) == 0:
        return {'error': 'No valid arguments supplied to api/comments'}

    # Return the first page of 10 by default.
    for field in ['search', 'sort', 'all']:
        if field in request_data:
            args[field] = request_data[field]
    if 'pageSize' in request_data:
        args['n'] = request_data['pageSize']
    if 'pageNumber' in request_data:
        args['page'] = request_data['pageNumber']

    try:
        cnx, cursor = db.get_cnx()
        db_comments = db.get_comments(cnx, cursor, **args)
    except Exception as e:
        return {'error': f"Error getting comments from database: {e}"}
    finally:
        db.close(cnx, cursor)

    if 'error' in db_comments:
        return {'error': db_comments['error']}
    return {'items': db_comments['comments']}


@app.route('/api/analyze_comments', methods=['POST'])
def analyze_comments():
    """Get new comments, analyze, add to db, refresh video
    """
    # ---STEP 1: GET COMMENTS FROM YOUTUBE
    # Parse the request
    request_data = request.get_json()
    user = request_data['user']
    user_id = user['id']
    channel_id = request_data['channelId']
    video_id = request_data['videoId']

    # Abandon the next_page_token stored in the video and start over form page 1.
    reset_token = None if 'resetToken' not in request_data else request_data['resetToken']
    max_retries = 10

    # Total number of NEW comments to be returned
    max_comments = int(request_data['maxComments'])

    # Get comments from YT in this order
    sort = None if not 'sort' in request_data else request_data['sort']

    # Get existing video data
    cnx, cursor = db.get_cnx()
    db_video = db.get_video(cnx, cursor, video_id)
    if 'video' not in db_video:
        db.close(cnx, cursor)
        return {'error': 'Video not in database'}
    video = db_video['video']
    next_page_token = None if ((reset_token) or ('next_page_token' not in video.keys())) \
                      else video['next_page_token']
    total_comments = None if 'total_comments' not in video else video['total_comments']

    db_comments = db.get_comments(cnx, cursor, video_id=video_id, all=True)
    all_ids = [comment['id'] for comment in db_comments['comments']]
    new_comments = []
    end = False
    error = False

    while not end and not error and max_retries > 0:
        args = {'video_id': video_id}
        if next_page_token:
            args['next_page_token'] = next_page_token
        if sort:
            args['sort'] = sort

        spend = spend_quota(cnx, cursor, user_id, 100, 'comments')
        if 'error' in spend.keys():
            error = spend['error']
            break
        logger.info(f"youtube_comments - {json.dumps(args)}")

        try:
            response = yt.comments(**args)
        except Exception as e:
            error = f"Error getting comments from YouTube: {e}"
            break

        resp_comments = response['comments']
        if len(resp_comments) == 0:
            end = 'No comments returned'
        else:
            loop_comments = [c for c in resp_comments if c['id'] not in all_ids]
            if len(loop_comments) == 0:
                max_retries -= 1
            else:
                loop_ids = [c['id'] for c in loop_comments]
                all_ids.extend(loop_ids)
                for comment in loop_comments:
                    comment['channel_id'] = channel_id
                new_comments.extend(loop_comments)
                if (len(new_comments) >= max_comments) | (len(all_ids) == total_comments):
                    end = "Reached target number of comments"

            if not response['next_page_token']:
                end = "End of search results"
            else:
                next_page_token = response['next_page_token']

    # ---STEP 2: ANALYZE & ADD TO DATABASE
    logger.info(f"analyze - {video_id}, {len(new_comments)}")
    new_analyzed = an.analyze(new_comments)
    for c in new_analyzed:
        db.set_comment(cnx, cursor, c['id'], c)

    # --STEP 3: REFRESH VIDEO
    all_comments = new_comments + db_comments['comments']

    n_topics = 200
    args = {
        'comment_topics': all_comments,
        'n_topics': n_topics,
    }
    db_channel = db.get_channel(cnx, cursor, channel_id)
    if 'error' in db_channel:
        db.close(cnx, cursor)
        return {'error': 'Error getting channel data for cluster.'}
    c = db_channel['channel']
    for field in ['subs_list', 'labels_list', 'ignore_list']:
        if c[field]:
            args[field] = c[field]
    clustered = cluster(**args)
    raw_topics = clustered['topics']
    labels = clustered['labels']

    video_topics = [{
        'token': token,
        'toks': toks,
        'score': n,
        'likes': likes,
        'sentiment': sentiment,
        'label': label,
        'comments': commentIds
    } for (token, toks, label, n, likes, sentiment, commentIds) in raw_topics]

    # --STEP 4: UPDATE DB VIDEO
    timestamp = datetime.datetime.now()
    reset_video = {
        'db_comments': len(all_ids),
        'next_page_token': next_page_token,
        'last_scan': timestamp,
        'topics': video_topics,
        'labels': labels,
        'last_refresh': timestamp,
    }
    db.set_video(cnx, cursor, video_id, reset_video)

    # --STEP 5: RETURN
    # Return all fields except topics, which will be retrieved page-by-page
    # by the feed when 'last_refresh' is updated on the front-end.
    refreshed_video = {**video, **reset_video}
    del refreshed_video['topics']

    refreshed_user = db.get_user(cnx, cursor, user_id)
    new_quota = refreshed_user['user']['quota']

    db.close(cnx, cursor)

    return {'video': refreshed_video, 'new_quota': new_quota}

# TOPICS

@app.route('/api/topics', methods=['POST'])
def topics():
    request_data = request.get_json()

    args = {'channel_id': request_data['channelId']}
    if 'videoId' in request_data:
        args['video_id'] = request_data['videoId']
    for field in ['search', 'labels', 'sort', 'all']:
        if field in request_data:
            if (request_data[field]):
                args[field] = request_data[field]
    if 'pageSize' in request_data:
        args['n'] = request_data['pageSize']
    if 'pageNumber' in request_data:
        args['page'] = request_data['pageNumber']
    if 'all' in request_data:
        args['all'] = request_data['all']

    try:
        logger.info(f"topics - {json.dumps(args)}")
        cnx, cursor = db.get_cnx()
        db_topics = db.get_topics(cnx, cursor, **args)
    except Exception as e:
        return {'error': f"Error getting topics from database: {e}"}
    finally:
        db.close(cnx, cursor)

    if 'error' in db_topics:
        return {'error': db_topics['error']}
    return {'items': db_topics['topics']}


@app.route('/api/refresh_video', methods=['POST'])
def refresh_video():
    # Get all comments, cluster topics, reset db
    request_data = request.get_json()
    channel_id = request_data['channelId']
    video_id = request_data['videoId']
    cnx, cursor = db.get_cnx()

    db_comments = db.get_comments(cnx, cursor, channel_id, video_id, all=True)
    all_comments = db_comments['comments']
    n_topics = 200
    args = {
        'comment_topics': all_comments,
        'n_topics': n_topics,
    }
    db_channel = db.get_channel(cnx, cursor, channel_id)
    if 'error' in db_channel:
        db.close(cnx, cursor)
        return {'error': 'Error getting channel data for cluster.'}
    c = db_channel['channel']
    for field in ['subs_list', 'labels_list', 'ignore_list']:
        if c[field]:
            args[field] = c[field]

    clustered = cluster(**args)
    raw_topics = clustered['topics']
    labels = clustered['labels']

    video_topics = [{
        'token': token,
        'toks': toks,
        'score': n,
        'likes': likes,
        'sentiment': sentiment,
        'label': label,
        'comments': commentIds
    } for (token, toks, label, n, likes, sentiment, commentIds) in raw_topics]

    timestamp = str(datetime.datetime.now())
    reset_video = {
        'db_comments': len(all_comments),
        'topics': video_topics,
        'labels': labels,
        'last_refresh': timestamp,
    }
    result = db.set_video(cnx, cursor, video_id, reset_video)
    db.close(cnx, cursor)

    return {"status": result, 'db_comments': len(all_comments),
            'last_refresh': timestamp}


@app.route('/api/refresh_channel', methods=['POST'])
def refresh_channel():
    # Get all comments, cluster topics, reset db
    request_data = request.get_json()
    channel_id = request_data['channelId']
    cnx, cursor = db.get_cnx()

    db_videos = db.get_videos(cnx, cursor, channel_id, all=True, all_data=True)
    if len(db_videos['videos']) == 0:
        db.close(cnx, cursor)
        return {'error': 'No videos for this channel'}
    new_channel = cluster_videos(db_videos['videos'])

    timestamp = str(datetime.datetime.now())
    reset_channel = {
        'db_comments': new_channel['db_comments'],
        'topics': new_channel['topics'],
        'labels': new_channel['labels'],
        'last_refresh': timestamp,
    }
    result = db.set_channel(cnx, cursor, channel_id, reset_channel)
    db.close(cnx, cursor)
    return {'status': result, 'db_comments': new_channel['db_comments'],
            'last_refresh': timestamp}


# OTHER

@app.route('/api/get_waitlist', methods=['POST'])
def get_waitlist():
    try:
        cnx, cursor = db.get_cnx()
        response = db.get_waitlist(cnx, cursor)
    except Exception as e:
        return {'error': f'Error fetching waitlist: {e}'}
    finally:
        db.close(cnx, cursor)

    return {'items': response['waitlist']}

@app.route('/api/add_waitlist', methods=['POST'])
def add_waitlist():
    request_data = request.get_json()
    if 'email' not in request_data.keys():
        return {'error': 'no email provided'}
    email = request_data['email']

    try:
        cnx, cursor = db.get_cnx()
        db.set_waitlist(cnx, cursor, email)
    except Exception as e:
        return {'error': f"Error adding email to database: {e}"}
    finally:
        db.close(cnx, cursor)

    return {'status': f"Successfully added {email} to waitlist."}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
