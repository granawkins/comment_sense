import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import VideoPlayer from "./VideoPlayer.jsx"
import Controller from "./Controller.jsx"
import Topics from "./Topics.jsx"

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
    const [topics, setTopics] = useState([])
    const [progress, setProgress] = useState(null)
    useEffect(() => {
        fetch(`/api/video/${videoId}`)
            .then(res => res.json())
            .then(data => {
                setVideoData(data.video_data)
                setTopics(data.video_data['topics'])
            })
    }, [])
    
    const analyze = (n) => {
        console.log("analyze")
    }

    return(
        <Grid container className={classes.root} direction="column">
            <Card>
                <VideoPlayer videoData={videoData} />
                <Controller 
                    videoData={videoData} 
                    progress={progress} 
                    analyze={analyze}
                />
            </Card>
            <Topics topics={topics}/>
        </Grid>
    )
}

export default withStyles(styles)(Video)
