import { useState, useEffect } from 'react'
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
        backgroundColor: '#f5f5f5',
        margin: '0',
        paddingTop: '10px',
    },
})

const Video = ({classes}) => {
    
    const { videoId } = useParams()
    const [videoData, setVideoData] = useState(null)
    const [commentsAnalyzed, setCommentsAnalyzed] = useState(0)
    const [commentsTotal, setCommentsTotal] = useState("...")
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(false)

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
                    setTopics(fields.includes('topics') ? data.video_data.topics : [])
                }
            })
    }, [])
    
    const analyze = (commentsTarget) => {
        setLoading(true)
        postData('/api/analyze', {
            videoData: videoData,
            nComments: commentsTarget
        }).then(data => {
            setCommentsAnalyzed(data.video_data['n_analyzed'])
            setTopics(data.video_data['topics'])
            setLoading(false)
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
                />
            </Card>
            <Topics 
                videoId={videoId}
                commentsAnalyzed={commentsAnalyzed} 
                topics={topics} 
                loading={loading} 
            />
        </Grid>
    )
}

export default withStyles(styles)(Video)
