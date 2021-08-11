import { useState, useEffect, useRef, useCallback } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import LoadingCircle from '../../../utils/LoadingCircle.js'
import { postData } from '../../../utils/helpers.js'

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

const Feed = ({query, control, render, classes}) => {

    // Add new items to the bottom of the feed
    const [feed, setFeed] = useState([])
    const addToFeed = async (items) => {
        setFeed(feed => [...feed, items.map(item => render(item))])
    }

    // Load content from api
    const [pageNumber, setPageNumber] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isEnd, setIsEnd] = useState(false)
    const [hasError, setHasError] = useState(false)
    const handleLoad = async () => {
        setIsLoading(true)
        try {
            let request_data = {
                ...query.data,
                ...control,
                pageNumber,
            }
            let result = await postData(query.api, request_data)
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

    // Trigger load when page number is updated
    useEffect(() => {
        if (pageNumber > 0) {
            handleLoad()
        }
    }, [pageNumber])

    // Update pageNumber when bottom of screen visible
    const [observing, setObserving] = useState(false)
    const handleObserver = (entries) => {
        const target = entries[0];
        setObserving(target.isIntersecting)
        if (target.isIntersecting && !isLoading && !hasError && !isEnd) {
            setPageNumber((p) => p + 1)
        }
    }

    // Hookup the observer element
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

    // Reset feed when control changes
    useEffect(() => {
        // console.log(`Feed is ${observing} observing; Control is ${JSON.stringify(control)}`)
        if (observing) {
            if (pageNumber === 1) {
                handleLoad()
            } else {
                setPageNumber(1)
            }
        } else {
            setPageNumber(0)
        }
        setFeed([])
    }, [control])

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

// const API_URLS = {
//     videos: '/api/videos',
//     topics: '/api/topics',
//     comments: '/api/comments',
// }

// const PAGE_SIZE = {
//     videos: 10,
//     topics: 20,
//     comments: 10,
// }

// const queryTemplate = ({user, videoId, search, sort, pageSize, pageNumber, next}) => {
//     return {
//         user: (user) ? user : null,
//         videoId: (videoId) ? videoId : null,
//         search: (search) ? search : null,
//         sort: (sort) ? sort : null,
//         pageSize: (pageSize) ? pageSize : 10,
//         pageNumber: (pageNumber) ? pageNumber : 1,
//     }
// }
