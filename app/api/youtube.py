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

    def channel(self, channel_id):
        request = self.youtube.channels().list(
            part = "snippet,statistics",
            id = channel_id,
        )
        try:
            response = request.execute()
        except Exception as e:
            return {'error': f"Couldn't load channel: {e}"}
        if len(response['items']) == 0:
            return {'error': 'Channel not found'}
        c = response['items'][0]
        channel = {
            'id': channel_id,
            'title': c['snippet']['title'],
            'thumbnail': c['snippet']['thumbnails']['medium']['url'],
            'total_videos': None if 'videoCount' not in c['statistics'] else int(c['statistics']['videoCount'])
        }
        return channel

    def videos(self, channel_id, max_results=50,
                       published_after=None, next_page=None):
        args = {
            'part': ['snippet'],
            'channelId': channel_id,
            'maxResults': int(max_results),
            'order': 'date',
        }
        if published_after:
            args['publishedAfter'] = published_after
        if next_page:
            args['pageToken'] = next_page
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
            'next_page_token': response['nextPageToken'],
            'total_videos': response['pageInfo']['totalResults'],
            'videos': videos,
        }
        return results

    def comments(self, channel_id, video_id, n=100, next_page_token=None):
        max_results = 1000
        n_results = min(int(n), max_results)
        max_per_loop = 100
        n_loops = math.ceil(n_results / max_per_loop)
        all_comments = []

        # Convert YT's format into CS's format
        def parse_comment(comment, parent=None, n_children=None):
            sn = comment['snippet']
            output = {
                "id": comment['id'],
                "video_id": sn['videoId'],
                "channel_id": channel_id,
                "author": sn['authorDisplayName'][:32],
                "published": sn['publishedAt'],
                "text": sn['textDisplay'][:1000],
                "likes": sn['likeCount'],
                "parent": parent,
                "n_children": n_children,
                "last_scan": str(datetime.now()),
            }
            return output

        for i in range(n_loops):
            # Get comments
            args = {
                'videoId': video_id,
                'part': 'id, snippet, replies',
                'maxResults': n_results,
                'order': 'relevance',
            }
            if (next_page_token):
                args['pageToken'] = next_page_token
            comments_request = self.youtube.commentThreads().list(**args)
            comments = comments_request.execute()

            # Parse useful fields
            if len(comments['items']) == 0:
                break
            next_page_token = None if 'nextPageToken' not in comments.keys() else comments['nextPageToken']
            for thread in comments['items']:

                # Flatten comments/replies, add parent_id or n_children
                n_children = 0 if 'totalReplyCount' not in thread['snippet'].keys() else thread['snippet']["totalReplyCount"]
                all_comments.append(parse_comment(thread['snippet']['topLevelComment'], None, n_children))
                parent_id = all_comments[-1]['id']
                if 'replies' in thread:
                    for reply in thread['replies']['comments']:
                        all_comments.append(parse_comment(reply, parent_id, 0))

        return {'comments': all_comments, 'next_page_token': next_page_token}

    def video(self, video_id):
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
