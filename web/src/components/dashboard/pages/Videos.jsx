import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Typography, Button } from '@material-ui/core'

import Controller from './Controller'
import Feed from './feed/Feed'
import VideoCard from './feed/VideoCard'

import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'
import ErrorPage from '../../utils/ErrorPage'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        // display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
    scanBlock: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    scanNow: {
        backgroundColor: theme.palette.csRed.main,
        color: 'white',
        top: '0',
        marginLeft: '20px',
    },
})

const Videos = ({user, channel, classes}) => {

    // const videoId = useParams().videoId
    const [pageLoading, setPageLoading] = useState(false)
    const [dbComments, setDBComments] = useState(null)
    const [totalComments, setTotalComments] = useState(null)
    useEffect(() => {
        if (channel) {
            setDBComments(channel.db_videos)
            setTotalComments(channel.total_videos ? channel.total_videos : "?")
        }
    }, [channel])

    const [hasError, setHasError] = useState(false)
    const scanVideos = async () => {
        setPageLoading(true)
        try {
            const response = await postData('/api/scan_videos', {
                user, // must contain valid channelId
                publishedAfter: null,
                resetToken: null, // start the next scan over from the beginning
                maxVideos: 100, // target number of videos to add
            })
            /*
            const response = {
                db_videos: Integer,
                next_page_token: String,
                total_videos: Integer,
                end: String,
                error: String,
            }
            */
            setDBComments(response.db_videos)
            setTotalComments(response.total_videos)
            setPageLoading(false)
        }
        catch {
            setHasError(true)
            setPageLoading(false)
        }
    }

    // Contains controller settings. Controller updates, Feed adds to api call.
    const [control, setControl] = useState(null)
    useEffect(() => {
        setControl({search: "", sort: "recent"})
    }, [])

    // Tells the Feed where to get items, and how to render them.
    const query = {
        api: '/api/videos',
        data: {user, pageSize: 10},
    }
    const render = (video) => {
        return <VideoCard type='video' data={video} key={video.id} />
    }


    const [placeholder, setPlaceholder] = useState("")
    useEffect(() => {
        if (pageLoading) {
            setPlaceholder(<LoadingCircle />)
        } else if (hasError) {
            setPlaceholder(<ErrorPage />)
        } else {
            setPlaceholder("")
        }
    }, [pageLoading, hasError])

    return(
        <div className={classes.root}>
            <div className={classes.scanBlock}>
                <Typography className={classes.body1}>{dbComments} scanned / {totalComments} videos</Typography>
                <Button
                    onClick={scanVideos}
                    className={classes.scanNow}
                    variant='contained'
                >SCAN NOW</Button>
            </div>
            {!control
                ? null
                : <Controller type='videos' control={control} setControl={setControl} />}
            {pageLoading || hasError
                ? placeholder
                : <Feed query={query} control={control} render={render} />}
        </div>
    )
}

export default withStyles(styles)(Videos)
