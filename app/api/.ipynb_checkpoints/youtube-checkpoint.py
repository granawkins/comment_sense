import os, math
import googleapiclient.discovery
from datetime import datetime
from id_hash import hash

def pretty_date(str):
    d1 = datetime.strptime(str,"%Y-%m-%dT%H:%M:%SZ")
    new_format = "%d %B, %Y"
    return d1.strftime(new_format)

class YouTube():

    def __init__(self):
        # Disable OAuthlib's HTTPS verification when running locally.
        # *DO NOT* leave this option enabled in production.
        os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

        api_service_name = "youtube"
        api_version = "v3"
        DEVELOPER_KEY = "AIzaSyCdIhCnjNW5k168C1qCXPnkOFqzn1NBnQ8"

        self.youtube = googleapiclient.discovery.build(
            api_service_name, api_version, developerKey = DEVELOPER_KEY)

    def get_id(self, username):
        # QUOTA COST: 1
        args = {'part': 'id', 'forUsername': username}
        request = self.youtube.channels().list(**args)
        try:
            response = request.execute()
        except Exception as e:
            raise RuntimeError(f"Error fetching channelId for username: {e}")
        if len(response['items']) == 0:
            raise RuntimeError(f"No channelId found for username.")
        id = response['items'][0]['id']
        return id

    def channel(self, key, index="id"):
        # QUOTA COST: 1
        args = {'part': 'snippet,statistics'}
        if index == 'id':
            args['id'] = key
        elif index == 'user':
            args['forUsername'] = key
        request = self.youtube.channels().list(**args)
        try:
            response = request.execute()
        except Exception as e:
            raise RuntimeError(f"Error fetching channel data from Youtube.")
        if len(response['items']) == 0:
            return {'error': 'Channel not found'}
        c = response['items'][0]
        channel = {
            'id': c['id'],
            'title': c['snippet']['title'],
            'thumbnail': c['snippet']['thumbnails']['medium']['url'],
            'total_videos': None if 'videoCount' not in c['statistics'] else int(c['statistics']['videoCount'])
        }
        return {'channel': channel}

    def videos(self, channel_id, max_results=50, published_after=None, next_page_token=None):
        # QUOTA COST: 100
        args = {
            'part': ['snippet'],
            'channelId': channel_id,
            'maxResults': int(max_results),
            'order': 'date',
        }
        if published_after:
            args['publishedAfter'] = published_after
        if next_page_token:
            args['pageToken'] = next_page_token

        try:
            search_request = self.youtube.search().list(**args)
            response = search_request.execute()
        except Exception as e:
            raise RuntimeError(f"Error getting channel videos from YouTube: {e}.")
        videos = []
        for item in response['items']:
            videos.append({
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                'channel_id': channel_id,
                'published': item['snippet']['publishedAt'],
            })
        results = {
            'next_page_token': None if not 'nextPageToken' in response else response['nextPageToken'],
            'total_videos': response['pageInfo']['totalResults'],
            'videos': videos,
        }
        return results

    def comments(self, video_id, next_page_token=None, sort='relevance'):
        # QUOTA COST: 1
        max_results = 100
        args = {
            'videoId': video_id,
            'part': 'id, snippet, replies',
            'maxResults': max_results,
            'order': sort,
        }
        if (next_page_token):
            args['pageToken'] = next_page_token

        try:
            comments_request = self.youtube.commentThreads().list(**args)
            response = comments_request.execute()
        except Exception as e:
            raise RuntimeError(f"Error getting video comments from YouTube: {e}.")

        # Convert YT's format into CS's format
        def parse_comment(comment, parent=None, n_children=None):
            sn = comment['snippet']
            output = {
                "id": comment['id'],
                "video_id": sn['videoId'],
                "author": sn['authorDisplayName'][:32],
                "published": sn['publishedAt'],
                "text": sn['textDisplay'][:1000],
                "likes": sn['likeCount'],
                "parent": parent,
                "n_children": n_children,
                "last_scan": str(datetime.now()),
            }
            return output

        # Parse comments from yt response
        comments = []
        for thread in response['items']:
            # Add the top level comment of each thread, and record the number of replies
            sn = thread['snippet']
            n_children = 0 if 'totalReplyCount' not in sn else sn["totalReplyCount"]
            parent_comment = parse_comment(sn['topLevelComment'], None, n_children)
            comments.append(parent_comment)

            # Add replies with a reference to the top-level comment
            if 'replies' in thread:
                parent_id = parent_comment['id']
                for child_comment in thread['replies']['comments']:
                    comments.append(parse_comment(child_comment, parent_id, 0))

        results = {
            'comments': comments,
            'next_page_token': None if 'nextPageToken' not in response else response['nextPageToken'],
        }
        return results

    def video(self, video_id):
        # QUOTA COST: 1
        video_request = self.youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=video_id
        )
        try:
            video = video_request.execute()
        except Exception as e:
            raise RuntimeError(f"Error getting video data from YouTube: {e}")
        if len(video['items']) == 0:
            return "Missing"
        else:
            sn = video['items'][0]['snippet']
            st = video['items'][0]['statistics']
            parsed = {
                "id": video_id,
                "title": sn['title'][:300],
                "thumbnail": sn['thumbnails']['medium']['url'],
                "channel_id": sn['channelId'][:100],
                "channel_title": sn['channelTitle'][:100],
                "published": pretty_date(sn['publishedAt']),
                "views": 0 if 'viewCount' not in st.keys() else st['viewCount'],
                "likes": 0 if 'likeCount' not in st.keys() else st['likeCount'],
                "dislikes": 0 if 'dislikeCount' not in st.keys() else st['dislikeCount'],
                "total_comments": 0 if 'commentCount' not in st.keys() else st['commentCount'],
            }
            return parsed
