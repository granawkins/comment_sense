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


const Feed = ({pageName}) => {
    const classes = useStyles();
    const key = useParams().key
    
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isEnd, setIsEnd] = useState(false)
    const [feed, setFeed] = useState([])
    const [pageNumber, setPageNumber] = useState(1)
    
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
            setPageNumber((n) => n + 1)
        }
    }
    
    const apiUrls = {
        recent: '/api/recent',
        search: '/api/search',
    }
    const handleLoad = async () => {
        if (isEnd) {
            return
        }
        try {
            let apiRef = (Object.keys(apiUrls).includes(pageName)) ? apiUrls[pageName] : null
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
    
    // const [intersecting, setIntersecting] = useState(true)
    const handleObserver = (entries) => {
        const target = entries[0];
        console.log(target)
        // if (target.isIntersecting) {
        //     handleLoad()
        // }
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
            <button onClick={handleLoad}>Load More</button>
            <div ref={loader} />
            {isLoading ? <div className={classes.loading}><LoadingCircle /></div> : null}
            {hasError ? <Typography className={classes.error}>ERROR</Typography> : null}
            {isEnd ? <Typography className={classes.error}>END OF FEED</Typography> : null}
        </div>
    )

    // const [feed, setFeed] = useState(<LoadingCircle />)
    // const key = useParams().key

    // const buildFeed = (data) => {
    //     let feedItems = []
    //     if (Object.keys(data).includes('channels')) {
    //         data.channels.reverse().forEach(channel => feedItems.push(
    //             <ChannelCard channel={channel} key={channel.channelId} />
    //         ))
    //     }
    //     if (Object.keys(data).includes('videos')) {
    //         data.videos.reverse().forEach(video => feedItems.push(
    //             <VideoCard video={video} key={video.id} />
    //         ))
    //     }
    //     setFeed(feedItems)
    // }
    
    // useEffect(() => {        
    //     const getRecent = async (n = 10) => {
    //         fetch(`/api/recent/${n}`)
    //             .then(res => res.json())
    //             .then(data => buildFeed(data))
    //     }
        
    //     const getSearch = async (key) => {
    //         fetch(`/api/search/${key}`)
    //             .then(res => res.json())
    //             .then(data => buildFeed(data))
    //     }
    
    //     const getEmpty = () => {
    //         setFeed(<p>Unrecognized feed type.</p>)
    //     }

    //     switch(page) {
    //         case 'recent': {
    //             getRecent(key)
    //             break
    //         }
    //         case 'search': {
    //             getSearch(key)
    //             break
    //         }
    //         default: {
    //             getEmpty()
    //             break
    //         }
    //     }
    // }, [page, key])

    // return(
    //     <Grid container className={classes.root} direction="column">
    //         {feed}
    //     </Grid>
    // )
}

export default Feed
