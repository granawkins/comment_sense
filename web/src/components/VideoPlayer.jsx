import { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';

import Details from './Details'
import VisibilityIcon from '@material-ui/icons/Visibility';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { thousands_separators } from '../helpers.js'

const styles = (theme) => ({
    root: {
        width: '100%',
        borderRadius: '0',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    },
    video: {
        width: '320px',
        height: '180px',
        border: 'none',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
            height: '333px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
            height: '432px',
        },
    },
    details: {
        padding: '10px',
        height: 'auto',
    },
    videoBackground: {
        width: '100%',
        backgroundColor: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    infoLine: {
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',        
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row',
        },
    },
})

const VideoPlayer = ({videoData, classes}) => {

    const [video, setVideo] = useState(null)
    
    useEffect(() => {
        setVideo(videoData)
    }, [videoData])

    if (!video) {
        return(
            <CircularProgress color='secondary'/>
        )
    } else {
        return(
            <div className={classes.root}>
                <div className={classes.videoBackground}>
                    <CardMedia 
                        component="iframe"
                        className={classes.video}
                        image={"http://youtube.com/embed/" + video.id} 
                    />
                </div>
                <div className={classes.details} >
                    <Typography variant="h6" style={{lineHeight: '1.1', marginBottom: '10px'}}>{video.title}</Typography>
                    <Typography variant="body1" ><u>{video.channelTitle}</u></Typography>
                    <Details video={video}></Details>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(VideoPlayer)