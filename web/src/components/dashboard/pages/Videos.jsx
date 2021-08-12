import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Controller from './Controller'
import Feed from './feed/Feed'
import VideoCard from './feed/VideoCard'

import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'
import ErrorPage from '../../utils/ErrorPage'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
})

// Rendered only after dashboard has a valid channel object
const Videos = ({user, channel, classes}) => {

    // const videoId = useParams().videoId
    const [dbVideos, setDBVideos] = useState(null)
    const [totalVideos, setTotalVideos] = useState(null)
    useEffect(() => {
        if (channel) {
            setDBVideos(channel.db_videos)
            setTotalVideos(channel.total_videos ? channel.total_videos : "?")
        }
    }, [channel])

    // Action Messaage is displayed on top of the controller, next to action button
    const [actionMessage, setActionMessage] = useState("")
    useEffect(() => {
        setActionMessage(`${dbVideos} scanned / ${totalVideos} videos`)
    }, [dbVideos, totalVideos])

    // ScanVideos is the primary action for the videos page.
    const [pageLoading, setPageLoading] = useState(false)
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
            setDBVideos(response.db_videos)
            setTotalVideos(response.total_videos)
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
        return <VideoCard video={video} key={video.id} />
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
            {!control
                ? null
                : <Controller
                    type='videos'
                    control={control}
                    setControl={setControl}
                    actionMessage={actionMessage}
                    action={scanVideos}
                    actionLabel="SCAN NOW"
                    sortOptions={['recent', 'oldest', 'top']}
                />}
            {pageLoading || hasError
                ? placeholder
                : <Feed
                    query={query}
                    control={control}
                    render={render}
                />}
        </div>
    )
}

export default withStyles(styles)(Videos)
