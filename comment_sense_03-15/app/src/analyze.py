import os
import googleapiclient.discovery
import json
from textblob import TextBlob
import mysql.connector

from youtube import YouTube
from database import Database

def analyze(videoId):

    # Casey Neistat:
    # - My Greatest Ever:       nrcMDnPTdBU
    # - Who I'm Voting For:     qaanivZHttE
    # - Make it Count (Nike):   WxfZkMm3wcg

    yt = YouTube()
    video_data = yt.video(videoId)
    comment_data = yt.comments(videoId, video_data['id'])

    # Initialize summary statistics
    n = 0
    sumPolarity = 0
    sumSubjectivity = 0
    sumPositive = 0
    sumNeutral = 0
    sumNegative = 0

    # Cycle through comments
    for c in comment_data:
        n += 1
        comment = TextBlob(c['textDisplay'])

        # Polarity: -1 to 1
        polarity = comment.sentiment.polarity
        sumPolarity += polarity
        c['polarity'] = polarity

        # Subjectivity: 0 (Objective) to 1 (Subjective)
        subjectivity = comment.sentiment.subjectivity
        sumSubjectivity += subjectivity
        c['subjectivity'] = subjectivity

        # Status: Negative (<0), Neutral (=0), Positive(>0)
        if polarity > 0:
            status = 'positive'
            sumPositive += 1
        elif polarity < 0:
            status = 'negative'
            sumNegative += 1
        else:
            status = 'neutral'
            sumNeutral += 1
        c['status'] = status

    # Add summary statistics to video data
    video_data["polarity"] = sumPolarity / n
    video_data["subjectivity"] = sumSubjectivity / n
    video_data["positive"] = sumPositive / n
    video_data["neutral"] = sumNeutral / n
    video_data["negative"] = sumNegative / n

    db = Database()
    db.add_video(video_data)
    db.add_comments(comment_data)