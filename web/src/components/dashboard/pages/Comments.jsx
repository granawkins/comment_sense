import { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/styles'
import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle';
import Comment from './feed/Comment'

const styles = (theme) => ({
    root: {
        maxHeight: '400px',
        overflow: 'auto',
    },
})

const CommentsBlock = ({videoId, topic, topicComments, classes}) => {

    const COMMENTS_PER_PAGE = 10

    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isEnd, setIsEnd] = useState(false)
    const [commentsFeed, setCommentsFeed] = useState([])
    const [lastLoaded, setLastLoaded] = useState(0)
    const loader = useRef(null)

    const addToFeed = (items) => {
        let newItems = []
        newItems = items.map(c => <Comment comment={c} key={c.id} />)
        setCommentsFeed(oldItems => [...oldItems, newItems])
        let newLast = lastLoaded + newItems.length
        if (newLast === topicComments.length) {
            setIsEnd(true)
        }
        setLastLoaded(newLast)
    }

    const handleLoad = async() => {
        if (isEnd || isLoading || hasError) {
            return
        }
        setIsLoading(true)
        try {
            let apiRef = '/api/comments'
            let data = {
                videoId: videoId,
                topic: topic,
                comments: topicComments.slice(lastLoaded, lastLoaded + COMMENTS_PER_PAGE)
            }
            let result = await postData(apiRef, data)
            let newItems = result.comments
            addToFeed(newItems)
            setIsLoading(false)
        }
        catch (err) {
            console.log("Error loading new topics.")
            setIsLoading(false)
            setHasError(true)
        }
    }

    const [pageNumber, setPageNumber] = useState(0)
    useEffect(() => {
        if (pageNumber > 0) {
            handleLoad()
        }
    }, [pageNumber])

    const handleObserver = (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoading) {
            setPageNumber((p) => p + 1)
        }
    }

    const [observer, setObserver] = useState(null)
    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        let newObserver = new IntersectionObserver(handleObserver, option);
        if (loader.current) newObserver.observe(loader.current);
        setObserver(newObserver)
    }, [])

    return (
        <div className={classes.root}>
            {commentsFeed}
            <div ref={loader} />
            {isLoading ? <div className={classes.loading}><LoadingCircle /></div> : null}
            {hasError ? <div className={classes.error}>ERROR</div> : null}
        </div>

    )

    // if (!comments) {
    //     return ( <LoadingCircle /> )
    // } else {
    //     return( comments.map(c => <Comment comment={c} key={c.id} />) )
    // }
}

export default withStyles(styles)(CommentsBlock)
