import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import { Link, withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography'
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import VideoCard from '../Feed/VideoCard'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        margin: '0',
        width: 'auto',
        padding: '20px',
    },
    more: {
        color: 'gray',
        padding: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

const Popular = ({classes}) => {

    const [feed, setFeed] = useState([])
    const buildFeed = (data) => {
        let feedItems = []
        if (Object.keys(data).includes('videos')) {
            data.videos.reverse().forEach(video => feedItems.push(
                <VideoCard video={video} key={video.id} />
            ))
        }
        setFeed(feedItems)
    }

    useEffect(() => {
        const getRecent = async (n = 10) => {
            fetch(`/api/recent/${n}`)
                .then(res => res.json())
                .then(data => buildFeed(data))
        }
        getRecent(10)
    }, [])

    return(
        <div className={classes.root}>
            {feed}
            <Link to={"../recent/25"} className={classes.more}>
                <Typography>more</Typography>
                <ChevronRightIcon />
            </Link>
        </div>
    )
}

export default withRouter(withStyles(styles)(Popular))
