import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Controller from './Controller'
import Feed from './feed/Feed'
import VideoCard from './feed/VideoCard'
import { postData, thousands_separator } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'
import LoadingBar from '../../utils/LoadingBar'
import ErrorPage from '../../utils/ErrorPage'
import ActionControl from './ActionControl'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0',
    },
    error: {
        color: theme.palette.csRed.main,
    },
    csRed: {
        color: 'white',
        backgroundColor: theme.palette.csRed.main,
    }
})

// Rendered only after dashboard has a valid channel object
const Videos = ({user, setUser, channel, classes}) => {

    // const videoId = useParams().videoId
    const [channelId, setChannelId] = useState(null)
    const [dbVideos, setDBVideos] = useState(null)
    const [totalVideos, setTotalVideos] = useState(null)
    useEffect(() => {
        if (channel) {
            setChannelId(channel.id)
            setDBVideos(channel.db_videos)
            setTotalVideos(channel.total_videos ? channel.total_videos : "?")
        }
    }, [channel])

    // Action Messaage is displayed on top of the controller, next to action button
    const [actionMessage, setActionMessage] = useState("")
    useEffect(() => {
        setActionMessage(`
            ${thousands_separator(dbVideos)} scanned /
            ${thousands_separator(totalVideos)} videos`
        )
    }, [dbVideos, totalVideos])

    // ScanVideos is the primary action for the videos page.
    const [grayout, setGrayout] = useState(null)
    const [hasError, setHasError] = useState(false)
    const scanVideos = async (maxVideos=100, resetToken=false, loadtime=5) => {
        setGrayout(loadtime)
        try {
            const response = await postData('/api/scan_videos', {
                user,
                channelId,
                maxVideos: maxVideos, // target number of videos to add
                resetToken: resetToken, // start the next scan over from the beginning
                publishedAfter: null,
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
            setUser({...user, quota: response.new_quota})
            setGrayout(false)
        }
        catch {
            setHasError(true)
            setGrayout(false)
        }
    }

    // Handle ActionControl popup menu
    const [actionOpen, setActionOpen] = useState(false)

    // Contains controller settings. Controller updates, Feed adds to api call.
    const [control, setControl] = useState(null)
    useEffect(() => {
        setControl({search: "", sort: "recent"})
    }, [])

    // Tells the Feed where to get items, and how to render them.
    const query = {
        api: '/api/videos',
        data: {channelId, pageSize: 10},
    }
    const render = (video) => {
        return <VideoCard video={video} key={video.id} />
    }

    return(
        <div className={classes.root}>
            {!control
                ? null
                : <Controller
                    type='videos'
                    control={control}
                    setControl={setControl}
                    actionMessage={actionMessage}
                    action={() => setActionOpen(true)}
                    actionLabel="SCAN NOW"
                    sortOptions={['recent', 'oldest', 'top']}
                />}
            {hasError
                ? <ErrorPage />
                : <Feed
                    query={query}
                    control={control}
                    render={render}
                />}
            <ActionControl
                // isOpen, handleClose, actionTitle, remaining, quota, verb, actionLabel, action
                isOpen={actionOpen}
                handleClose={() => setActionOpen(false)}
                actionTitle="Scan Videos"
                remaining={totalVideos - dbVideos}
                quota={user ? user.quota : null}
                verb="Scan"
                actionLabel="SCAN NOW"
                action={scanVideos}
            />
            {grayout && <LoadingBar loadTime={grayout} />}
        </div>
    )
}

export default withStyles(styles)(Videos)
