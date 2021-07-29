import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import FeedCard from '../Feed/FeedCard.jsx'
import TopicCard from '../Topics/TopicCard.jsx'
import LoadingCircle from '../../utils/LoadingCircle.js'
import { postData } from '../../utils/helpers.js'

const API_URLS = {
    videos: '/api/videos',
    topics: '/api/topics',
    comments: '/api/comments',
}

const PAGE_SIZE = {
    videos: 10,
    topics: 20,
    comments: 10,
}

const queryTemplate = ({user, videoId, search, sort, pageSize, pageNumber, next}) => {
    return {
        user: (user) ? user : null,
        videoId: (videoId) ? videoId : null,
        search: (search) ? search : null,
        sort: (sort) ? sort : null,
        pageSize: (pageSize) ? pageSize : 10,
        pageNumber: (pageNumber) ? pageNumber : 1,
    }
}

const styles = (theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        margin: '0',
        padding: '10px 0',
        alignItems: 'center',
        [theme.breakpoints.up('md')]: {
            alignItems: 'start',
        },
    },
    loading: {
        margin: '20px 0',
    },
    error: {
        width: '100%',
        textAlign: 'center',
        color: 'gray',
        padding: '20px',
        fontWeight: '400',
    }
})

const Feed = ({user, type, classes}) => {
    const videoId = useParams().videoId

    // The controller modifies control, and control is added to the query
    const [control, setControl] = useState({search: null, sort: null, labels: null})

    // Add items to feed, based on their type

    const [feed, setFeed] = useState([])
    const [maxScore, setMaxScore] = useState(0)
    const [labels, setLabels] = useState(0)
    const addToFeed = async (items) => {
        if (type === 'videos') {
            setFeed(feed => [...feed, items.map(video => {
                return <FeedCard type='video' data={video} key={video.id} />
            })])
        } else if (type === 'topics') {
            let newMax = Math.max(maxScore, items[0].score)
            setMaxScore(newMax)
            setFeed(feed => [...feed, items.map(t => {
                return <TopicCard videoId={videoId} topic={t} max={newMax} key={t.token} type={type} />
            })])
        }
    }

    // Get data from the server:
    // - Get the correct address
    // - Put together a request
    // - Send it and route the result based on its length

    const [isEnd, setIsEnd] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [pageNumber, setPageNumber] = useState(0)
    const handleLoad = async () => {
        if (isEnd) {
            return
        }
        setIsLoading(true)
        try {
            let apiRef = (Object.keys(API_URLS).includes(type)) ? API_URLS[type] : null
            let data = queryTemplate({
                ...control,
                user,
                pageNumber,
                pageSize: PAGE_SIZE[type],
                videoId: (videoId) ? videoId : null,
            })
            let result = await postData(apiRef, data)
            if (result.items.length === 0) {
                setIsEnd(true)
                setIsLoading(false)
            } else {
                addToFeed(result.items).then(() => setIsLoading(false))
            }
        }
        catch (err) {
            console.log(`Error loading new items: ${err}`)
            setIsLoading(false)
            setHasError(true)
        }
    }

    // Hookup infinite scrolling watcher
    // - Page loads when pageNumber is incremented
    // - When 'loader' div is visible, if not loading/end/error, increment pageNumber

    useEffect(() => {
        if (pageNumber > 0) {
            handleLoad()
        }
    }, [pageNumber])

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && !hasError && !isEnd) {
            console.log(`setting page number to ${pageNumber + 1}`)
            setPageNumber((p) => p + 1)
        } else {
            console.log(`ignoring observer`)
        }
    }

    const loader = useRef(null)
    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option)
        if (loader.current) observer.observe(loader.current)
    }, [])

    return (
        <div className={classes.root}>
            {feed}
            <div ref={loader} />
            {isLoading ? <div className={classes.loading}><LoadingCircle /></div> : null}
            {hasError ? <Typography className={classes.error}>ERROR</Typography> : null}
            {isEnd ? <Typography className={classes.error}>END OF FEED</Typography> : null}
        </div>
    )
}

export default withStyles(styles)(Feed)
