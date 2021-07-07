import os
import googleapiclient.discovery
import datetime
from id_hash import hash

def pretty_date(str):
    d1 = datetime.datetime.strptime(str,"%Y-%m-%dT%H:%M:%SZ")
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

    def search(self, key, n=25):
        search_request = self.youtube.search().list(
            part="snippet",
            type="video",
            maxResults=n,
            q=key,
        ) 
        videos = search_request.execute()
        parsed = []
        for video in videos['items']:
            vid = video['id']['videoId']
            title = video['snippet']['title'][:300]
            channelId = video['snippet']['channelId'][:100]
            channelTitle = video['snippet']['channelTitle'][:100]
            thumbnail = video['snippet']['thumbnails']['medium']['url']
            publishedAt = pretty_date(video['snippet']['publishedAt'])

            output = {
                "id": vid,
                "title": title,
                "channelId": channelId,
                "channelTitle": channelTitle,
                "thumbnail": thumbnail,
                'publishedAt': publishedAt
            }
            parsed.append(output)
        return parsed

    def video(self, videoId):
        video_request = self.youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=videoId
        )
        video = video_request.execute()
        if len(video['items']) == 0:
            return "Missing"
        else:
            sn = video['items'][0]['snippet']
            st = video['items'][0]['statistics']
            parsed = {
                "id": video['items'][0]['id'],
                "title": sn['title'][:300],
                "thumbnail": sn['thumbnails']['medium']['url'],
                "channelId": sn['channelId'][:100],
                "channelTitle": sn['channelTitle'][:100],
                "published": pretty_date(sn['publishedAt']),
                "views": 0 if 'viewCount' not in st.keys() else st['viewCount'],
                "likes": 0 if 'likeCount' not in st.keys() else st['likeCount'],
                "dislikes": 0 if 'dislikeCount' not in st.keys() else st['dislikeCount'],
                "comments": 0 if 'commentCount' not in st.keys() else st['commentCount'],
            }
            return parsed

    def comments(self, videoId, req):
        n = req['nComments']
        comments_request = self.youtube.commentThreads().list(
            part="id,snippet,replies",
            maxResults=n,
            order="relevance",
            videoId=videoId
        )
        comments = comments_request.execute()
        parsed = []
        for thread in comments['items']:
            # Flatten comments/replies, add 'level' field
            n_children = 0 if 'totalReplyCount' not in thread['snippet'].keys() else thread['snippet']["totalReplyCount"]
            parsed.append(parse_comment(thread['snippet']['topLevelComment'], None, n_children))
            parent_id = parsed[-1]['id']
            if 'replies' in thread:
                for reply in thread['replies']['comments']:
                    parsed.append(parse_comment(reply, parent_id, 0))
        return parsed

def parse_comment(comment, parent, n_children=None):

    videoId = comment['snippet']['videoId']
    author = comment['snippet']['authorDisplayName']
    text = comment['snippet']['textDisplay']
    commentId = hash(videoId, author, text)

    output = {
        "id": commentId,
        "videoId": videoId,
        "text": text[:1000],
        "author": author[:32],
        "parent": parent,
        "likes": comment['snippet']['likeCount'],
        "published": comment['snippet']['publishedAt']
    }

    if n_children:
        output['n_children'] = n_children

    return output
