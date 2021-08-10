import { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';

import Details from './Details'
import LoadingCircle from '../../utils/LoadingCircle';

const styles = (theme) => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
            height: '333px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
            height: '432px',
        },
    },
    videoBackground: {
        width: '100%',
        backgroundColor: 'black',
    },
    details: {
        padding: '10px',
        boxSizing: 'border-box',
        height: 'auto',
        width: '100%',
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
    const [title, setTitle] = useState("")
    const [channelTitle, setChannelTitle] = useState("")

    useEffect(() => {
        setVideo(videoData)
        if (videoData) {
            setTitle(videoData.title)
            setChannelTitle(videoData.channelTitle)
        }
    }, [videoData])

    return(
        <div className={classes.root}>
            <div className={`${classes.video} ${classes.videoBackground}`}>
                {!video
                    ? <LoadingCircle />
                    :  <CardMedia
                        component="iframe"
                        className={classes.video}
                        image={"http://youtube.com/embed/" + video.id}
                    />
                }
            </div>
            <div className={classes.details} >
                <Typography variant="h6" style={{lineHeight: '1.1', marginBottom: '10px'}}>{title}</Typography>
                <Typography variant="body1" ><u>{channelTitle}</u></Typography>
                <Details videoData={videoData}></Details>
            </div>
        </div>
    )
    // }
}

export default withStyles(styles)(VideoPlayer)
