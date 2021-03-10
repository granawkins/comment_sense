import os
import googleapiclient.discovery

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
            output = {
                "id": vid,
                "title": title,
                "channelId": channelId,
                "channelTitle": channelTitle,
                "thumbnail": thumbnail
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
            v = video['items'][0]
            parsed = {
                "id": v['id'],
                "title": v['snippet']['title'][:300],
                "channelId": v['snippet']['channelId'][:100],
                "channelTitle": v['snippet']['channelTitle'][:100],
                "thumbnail": v['snippet']['thumbnails']['medium']['url'],
                "views": v['statistics']['viewCount'],
                "likes": v['statistics']['likeCount'],
                "dislikes": v['statistics']['dislikeCount'], 
                "comments": v['statistics']['commentCount'],
            }
            return parsed

    def comments(self, videoId, channelId=None, n=10):
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
            parsed.append(parse_comment(thread['snippet']['topLevelComment'], 0, channelId))
            if 'replies' in thread:
                for reply in thread['replies']['comments']:
                    parsed.append(parse_comment(reply, 1, channelId))
        return parsed

def parse_comment(comment, level, channelId):
    return {
        "id": comment['id'],
        "level": level,
        "videoId": comment['snippet']['videoId'],
        "channelId": channelId,
        "textDisplay": comment['snippet']['textDisplay'][:1000],
        "authorDisplayName": comment['snippet']['authorDisplayName'],
        "likedCount": comment['snippet']['likeCount'],
        "publishedAt": comment['snippet']['publishedAt']
    }