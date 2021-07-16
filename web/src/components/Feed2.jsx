import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import VideoCard from "./Feed/VideoCard.jsx"
import ChannelCard from "./Feed/ChannelCard.jsx"
import LoadingCircle from '../utils/LoadingCircle';
import { postData } from '../utils/helpers.js';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
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
}));

const API_URLS = {
    recent: '/api/recent',
    search: '/api/search',
}

const Feed = ({pageName}) => {
    const classes = useStyles();
    const key = useParams().key
    
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isEnd, setIsEnd] = useState(false)
    const [feed, setFeed] = useState([])
    const [pageNumber, setPageNumber] = useState(0)
    
    const addToFeed = (items) => {
        let newItems = []
        if (Object.keys(items).includes('channels')) {
            items.channels.reverse().forEach(channel => newItems.push(
                <ChannelCard channel={channel} key={channel.channelId} />
            ))
        }
        if (Object.keys(items).includes('videos')) {
            items.videos.reverse().forEach(video => newItems.push(
                <VideoCard video={video} key={video.id} />
            ))
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
                page: pageNumber
            }
            console.log(apiRef)
            console.log(data)
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
        <div>
            {feed}
            <div ref={loader} />
            {isLoading ? <div className={classes.loading}><LoadingCircle /></div> : null}
            {hasError ? <Typography className={classes.error}>ERROR</Typography> : null}
            {isEnd ? <Typography className={classes.error}>END OF FEED</Typography> : null}
        </div>
    )
}

export default Feed
