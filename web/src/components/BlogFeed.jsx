import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FeedCard from "./Feed/FeedCard.jsx"
import LoadingCircle from '../utils/LoadingCircle';
import { postData } from '../utils/helpers.js';

const styles = (theme) => ({
    root: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    feed: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        padding: '0',
        margin: '10px 0 0 0',
        boxSizing: 'border-box',
        [theme.breakpoints.up('sm')]: {
            width: '480px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    }
})

const BlogFeed = ({classes}) => {
    const POSTS_PER_PAGE = 5
    const pageNumber = useParams().pageNumber

    const [feed, setFeed] = useState(null)
    const buildFeed = (items) => {
        let newItems = items.map(item => <FeedCard type='blog' data={item} />)
        setFeed(newItems)
    }

    const handleLoad = async (n) => {
        fetch('./api/blogs')
            .then(res => res.json())
            .then(data => {
                let start = POSTS_PER_PAGE * (n-1)
                let finish = Math.min(POSTS_PER_PAGE, data.posts.length - start)
                buildFeed(data.posts.slice(start, finish))
            })
    }

    useEffect(() => {
        let n = pageNumber ? pageNumber : 1
        handleLoad(n)
    }, [])

    return (
        <div className={classes.root}>
            {feed ? feed : <LoadingCircle />}
        </div>
    )
}

export default withStyles(styles)(BlogFeed)
