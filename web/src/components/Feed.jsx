import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import VideoCard from "./Feed/VideoCard.jsx"
import ChannelCard from "./Feed/ChannelCard.jsx"
import LoadingCircle from '../utils/LoadingCircle';

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
}));


const Feed = ({page}) => {
    const classes = useStyles();
    const [feed, setFeed] = useState(<LoadingCircle />)
    const key = useParams().key

    const buildFeed = (data) => {
        let feedItems = []
        if (Object.keys(data).includes('channels')) {
            data.channels.reverse().forEach(channel => feedItems.push(
                <ChannelCard channel={channel} key={channel.channelId} />
            ))
        }
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
        
        const getSearch = async (key) => {
            fetch(`/api/search/${key}`)
                .then(res => res.json())
                .then(data => buildFeed(data))
        }
    
        const getEmpty = () => {
            setFeed(<p>Unrecognized feed type.</p>)
        }

        switch(page) {
            case 'recent': {
                getRecent(key)
                break
            }
            case 'search': {
                getSearch(key)
                break
            }
            default: {
                getEmpty()
                break
            }
        }
    }, [page, key])

    return(
        <Grid container className={classes.root} direction="column">
            {feed}
        </Grid>
    )
}

export default Feed
