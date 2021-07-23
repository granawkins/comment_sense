import { useState, useEffect, createContext } from 'react'
import { useParams } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'

import { postData } from '../utils/helpers'
import VideoPlayer from "./Video/VideoPlayer.jsx"
import Controller from "./Video/Controller.jsx"
import Topics from "./Topics/Topics.jsx"

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        margin: '0',
        paddingTop: '10px',
    },
})

const ControllerContext = createContext({sentimentOn: true})

const VideoPage = ({classes}) => {

    const { videoId } = useParams()
    const [videoData, setVideoData] = useState(null)
    const [commentsAnalyzed, setCommentsAnalyzed] = useState(0)
    const [commentsTotal, setCommentsTotal] = useState("...")
    const [pageToken, setPageToken] = useState(null)
    const [loading, setLoading] = useState(false)

    const [sentimentOn, setSentimentOn] = useState(true)
    const toggleSentiment = () => {
        setSentimentOn(!sentimentOn)
    }

    useEffect(() => {
        fetch(`/api/video/${videoId}`)
            .then(res => res.json())
            .then(data => {
                if (!data.video_data) {
                    console.log("No video data.")
                } else {
                    setVideoData(data.video_data)
                    let fields = Object.keys(data.video_data)
                    setCommentsTotal(fields.includes('comments') ? data.video_data.comments : 0)
                    setCommentsAnalyzed(fields.includes('n_analyzed') ? data.video_data.n_analyzed : 0)
                    setPageToken(fields.includes('next_page_token') ? data.video_data.next_page_token : null)
                }
            })
    }, [])

    const analyze = (commentsTarget) => {
        setLoading(true)
        postData('/api/analyze', {
            videoData: {...videoData, 'next_page_token': pageToken},
            nComments: commentsTarget
        }).then(data => {
            setLoading(false)
            setCommentsAnalyzed(data.video_data['n_analyzed'])
            setPageToken(data.video_data['next_page_token'])
        })
    }

    return(
        <Grid container className={classes.root} direction="column">
            <Card>
                <VideoPlayer videoData={videoData} />
                <Controller
                    commentsAnalyzed={commentsAnalyzed}
                    commentsTotal={commentsTotal}
                    loading={loading}
                    analyze={analyze}
                    sentimentOn={sentimentOn}
                    toggleSentiment={toggleSentiment}
                />
            </Card>
            <ControllerContext.Provider value={{sentimentOn: sentimentOn}}>
                <Topics
                    videoId={videoId}
                    commentsAnalyzed={commentsAnalyzed}
                    loadingComments={loading}
                />
            </ControllerContext.Provider>
        </Grid>
    )
}

const Video = withStyles(styles)(VideoPage)


export {Video, ControllerContext}
