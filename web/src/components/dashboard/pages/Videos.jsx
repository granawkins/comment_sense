import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Controller from './Controller'
import Feed from './feed/Feed'
import VideoCard from './feed/VideoCard'
import { postData, thousands_separator, formatTimestamp } from '../../utils/helpers'
import LoadingBar from '../../utils/LoadingBar'
import ErrorPage from '../../utils/ErrorPage'
import ScanVideos from '../welcome/ScanVideos'

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
const Videos = ({user, setUser, channel, setChannel, classes}) => {

    const [channelId, setChannelId] = useState(null)
    const [dbVideos, setDBVideos] = useState(null)
    const [totalVideos, setTotalVideos] = useState(null)
    const [lastScan, setLastScan] = useState(null)
    const [scanOpen, setScanOpen] = useState(false)
    useEffect(() => {
        if (channel) {
            setChannelId(channel.id)
            setTotalVideos(channel.total_videos)
            setDBVideos(channel.db_videos)
            setLastScan(channel.last_scan ? formatTimestamp(channel.last_scan) : 'never')
            if (channel.db_videos === 0) {
                setScanOpen(true)
            }
        }
    }, [channel])

    // Action Messaage is displayed on top of the controller, next to action button
    const [loadtime, setLoadtime] = useState(null)
    const [actionMessage, setActionMessage] = useState("")
    useEffect(() => {
        setLoadtime(5 + Math.ceil((totalVideos - dbVideos) / 50))
        setActionMessage(`${thousands_separator(dbVideos)} scanned / ${thousands_separator(totalVideos)} videos`)
    }, [dbVideos, totalVideos])

    // ScanVideos is the primary action for the videos page.
    const [grayout, setGrayout] = useState(null)
    const [hasError, setHasError] = useState(false)
    const refresh = async () => {
        setGrayout(loadtime)
        try {
            const response = await postData('/api/refresh_videos', {
                user,
                channelId,
                uploads_playlist: channel.uploads_playlist,
            })
            /*
            const response = {
                db_videos: Integer,
                total_videos: Integer,
                end: String,
                error: String,
                new_quota: Integer,
                last_scan: timestamp
            }
            */
            setTotalVideos(response.total_videos)
            setDBVideos(response.db_videos)
            setLastScan(formatTimestamp(response.last_scan))
            setUser({...user, quota: response.new_quota})
            setChannel({
                ...channel,
                db_videos: dbVideos,
                total_videos: totalVideos,
            })
            setControl({...control, dbVideos})
            setGrayout(false)
        }
        catch {
            setHasError(true)
            setGrayout(false)
        }
    }

    // Contains controller settings. Controller updates, Feed adds to api call.
    const [control, setControl] = useState(null)
    useEffect(() => {
        setControl({search: "", sort: "recent", dbVideos})
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
            {control && <Controller
                type='videos'
                control={control}
                setControl={setControl}
                actionMessage={actionMessage}
                refresh={refresh}
                lastRefresh={lastScan}
                sortOptions={['recent', 'oldest', 'top']}
            />}
            {hasError
                ? <ErrorPage />
                : <Feed
                    query={query}
                    control={control}
                    render={render}
                />}
            {grayout && <LoadingBar loadTime={grayout} />}
            {scanOpen && <ScanVideos
                close={() => setScanOpen(false)}
                refresh={refresh}
                loadtime={loadtime}
            />}
        </div>
    )
}

export default withStyles(styles)(Videos)
