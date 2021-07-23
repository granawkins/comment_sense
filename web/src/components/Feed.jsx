import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FeedCard from "./Feed/FeedCard.jsx"
import LoadingCircle from '../utils/LoadingCircle';
import { postData } from '../utils/helpers.js';

const styles = (theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        margin: '0',
        padding: '10px 0',
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

const API_URLS = {
    recent: '/api/recent',
    top: '/api/top',
    search: '/api/search',
}

const Feed = ({pageName, classes}) => {
    const key = useParams().key

    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isEnd, setIsEnd] = useState(false)
    const [feed, setFeed] = useState([])
    const [pageNumber, setPageNumber] = useState(0)
    const [nextPageToken, setNextPageToken] = useState(null)

    const addToFeed = (items) => {
        let newItems = []
        if (Object.keys(items).includes('channels')) {
            items.channels.forEach(channel => newItems.push(
                <FeedCard type='channel' data={channel} key={channel.channelId} />
            ))
        }
        if (Object.keys(items).includes('videos')) {
            items.videos.forEach(video => newItems.push(
                <FeedCard type='video' data={video} key={video.id} />
            ))
        }
        if (Object.keys(items).includes('next')) {
            setNextPageToken(items.next)
        }
        if (newItems.length === 0) {
            setIsEnd(true)
        } else {
            setFeed(oldItems => [...oldItems, newItems])
        }
    }

    const handleLoad = async () => {
        if (isEnd) {
            return
        }
        setIsLoading(true)
        try {
            let apiRef = (Object.keys(API_URLS).includes(pageName)) ? API_URLS[pageName] : null
            let data = {
                key: (key) ? key : null,
                page: pageNumber,
                next: (nextPageToken) ? nextPageToken : null
            }
            let newItems = await postData(apiRef, data)
            addToFeed(newItems)
            setIsLoading(false)
        }
        catch (err) {
            console.log(`Error loading new items: ${err}`)
            setIsLoading(false)
            setHasError(true)
        }
    }

    useEffect(() => {
        if (pageNumber > 0) {
            handleLoad()
        }
    }, [pageNumber])

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && !hasError && !isEnd) {
            setPageNumber((p) => p + 1)
        }
    }

    const loader = useRef(null)
    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) observer.observe(loader.current);
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
