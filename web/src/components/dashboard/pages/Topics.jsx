import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

import Controller from './Controller'
import Feed from './feed/Feed'
import TopicCard from './feed/TopicCard'

import { postData, thousands_separator, formatTimestamp } from '../../utils/helpers'
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
    grayout: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        backgroundColor: fade(theme.palette.primary.main, 0.5),
    },
})

const TopicContext = createContext()

// Rendered only after dashboard has a valid channel object
const Topics = ({user, page, channel=null, video=null, analyze=null,
                 grayout=null, classes}) => {

    const [channelId, setChannelId] = useState(null)
    const [dbComments, setDBComments] = useState(null)
    const [dbVideos, setDBVideos] = useState(null)
    const [totalComments, setTotalComments] = useState(null)
    const [lastRefresh, setLastRefresh] = useState(null)
    const [allLabels, setAllLabels] = useState(null)
    useEffect(() => {
        if (channel && page === 'channel') {
            setChannelId(channel.id)
            setDBComments(channel.db_comments)
            setDBVideos(channel.total_videos ? channel.total_videos : "?")
            setAllLabels(channel.labels ? channel.labels : null)
            setLastRefresh(channel.last_refresh ? formatTimestamp(channel.last_refresh) : null)
        } else if (video && page === 'video') {
            setChannelId(video.channel_id)
            setDBComments(video.db_comments)
            setTotalComments(parseInt(video.total_comments))
            setAllLabels(video.labels ? video.labels : null)
            setLastRefresh(video.last_refresh ? formatTimestamp(video.last_refresh) : null)
        }
    }, [channel, video])


    // Contains controller settings. Controller updates, Feed adds to api call.
    const [control, setControl] = useState(null)
    const [display, setDisplay] = useState(null)
    useEffect(() => {
        setControl({pageSize: 25, search: ""})
        setDisplay({sentimentEnabled: user.sentiment_on, sentimentOn: false})
    }, [])


    // Action Messaage is displayed on top of the controller, next to action button
    const [actionMessage, setActionMessage] = useState("")
    useEffect(() => {
        if (page === 'channel') {
            setActionMessage(`
                ${thousands_separator(dbComments)} comments,
                ${thousands_separator(dbVideos)} videos
            `)
        } else if (page === 'video') {
            setActionMessage(`
                ${thousands_separator(dbComments)} comments /
                ${thousands_separator(totalComments)} total
            `)
        }
    }, [dbComments, dbVideos, totalComments])

    // Refresh (channel or video) is a secondary action for the videos and channel page.
    // Recalculate the entity's topics list and reset dbComments.
    const [pageLoading, setPageLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const refresh = async () => {
        setPageLoading(true)
        try {
            const response = await postData(`/api/refresh_${page}`, {
                channelId, // must contain valid channelId
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
            setLastRefresh(formatTimestamp(response.last_refresh))
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
            channelId,
            pageSize: 25,
            videoId: video ? video.id : null,
        },
    }
    const render = (topic, maxScore=0) => {
        return <TopicCard
            videoId={video ? video.id : null}
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
            {!control || !display
                ? null
                : <Controller
                    type='topics'
                    control={control}
                    setControl={setControl}
                    display={display}
                    setDisplay={setDisplay}
                    actionMessage={actionMessage}
                    action={analyze}
                    actionLabel={'ANALYZE'}
                    allLabels={allLabels}
                    refresh={refresh}
                    lastRefresh={lastRefresh}
                />}
            {pageLoading || hasError
                ? placeholder
                : <TopicContext.Provider value={{display}}>
                    <Feed
                        query={query}
                        control={control}
                        render={render}
                    />
                </TopicContext.Provider>
                }
            {grayout
                ? <div className={classes.grayout} />
                : null
            }
        </div>
    )
}

export default withStyles(styles)(Topics)
export {TopicContext}
