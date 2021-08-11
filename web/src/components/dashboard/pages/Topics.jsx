import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Controller from './Controller'
import Feed from './feed/Feed'
import TopicCard from './feed/TopicCard'

import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'
import ErrorPage from '../../utils/ErrorPage'

const formatDate = (timestamp) => {
    const ms = Date.parse(timestamp)
    const date = new Date(ms)
    return date.toLocaleString()
}

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
const Topics = ({user, channel, video=null, page, classes}) => {

    const [dbComments, setDBComments] = useState(null)
    const [dbVideos, setDBVideos] = useState(null)
    const [totalComments, setTotalComments] = useState(null)
    const [lastRefresh, setLastRefresh] = useState(null)
    const [allLabels, setAllLabels] = useState(null)
    useEffect(() => {
        if (channel && page === 'channel') {
            setDBComments(channel.db_comments)
            setDBVideos(channel.total_videos ? channel.total_videos : "?")
            setAllLabels(channel.labels ? channel.labels : null)
            setLastRefresh(channel.last_refresh ? formatDate(channel.last_refresh) : null)
        } else if (video && page === 'video') {
            setDBComments(video.db_comments)
            setTotalComments(video.total_comments)
            setAllLabels(video.labels ? video.labels : null)
            setLastRefresh(video.last_refresh ? formatDate(video.last_refresh) : null)
        }
    }, [channel, video])


    // Contains controller settings. Controller updates, Feed adds to api call.
    const [control, setControl] = useState(null)
    useEffect(() => {
        setControl({pageSize: 25, search: ""})
    }, [])

    // Action Messaage is displayed on top of the controller, next to action button
    const [actionMessage, setActionMessage] = useState("")
    useEffect(() => {
        if (page === 'channel') {
            setActionMessage(`${dbComments} comments, ${dbVideos} videos`)
        } else if (page === 'video') {
            setActionMessage(`${dbComments} comments / ${totalComments} total`)
        }
    }, [dbComments, dbVideos, totalComments])

    // Refresh (channel or video) is the primary action for the videos page.
    // Recalculate the entity's topics list and reset dbComments.
    const [pageLoading, setPageLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const refresh = async () => {
        setPageLoading(true)
        try {
            const response = await postData(`/api/refresh_${page}`, {
                user, // must contain valid channelId
                videoId: video ? video.id : null,
            })
            /*
            const response = {
                status: String,
                error: String,
                db_comments: Integer,
                last_refresh: String,
            }
            */
            setDBComments(response.db_comments)
            setLastRefresh(formatDate(response.last_refresh))
            setPageLoading(false)
        }
        catch {
            setHasError(true)
            setPageLoading(false)
        }
    }

    // Tells the Feed where to get items, and how to render them.
    const query = {
        api: '/api/topics',
        data: {
            user,
            pageSize: 25,
            videoId: video ? video.id : null,
        },
    }
    const render = (topic, maxScore=0) => {
        return <TopicCard
            topic={topic}
            max={maxScore}
            key={topic.token}
        />
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
                    type='topics'
                    control={control}
                    setControl={setControl}
                    actionMessage={actionMessage}
                    allLabels={allLabels}
                    refresh={refresh}
                    lastRefresh={lastRefresh}
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

export default withStyles(styles)(Topics)
