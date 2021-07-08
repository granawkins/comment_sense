import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FeedCard from "./FeedCard.jsx"
import LoadingCircle from '../utils/LoadingCircle';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        margin: '0',
        paddingTop: '10px',
    },
}));


const Feed = ({page}) => {
    const classes = useStyles();
    const [feed, setFeed] = useState(<LoadingCircle />)
    const key = useParams().key

    const buildFeed = (video_data) => {
        setFeed(video_data.reverse().map(video => <FeedCard video={video} key={video.id} />))
    }
    
    useEffect(() => {        
        const getRecent = async (n = 10) => {
            fetch(`/api/recent/${n}`)
                .then(res => res.json())
                .then(data => buildFeed(data.videos))
        }
    
        const getSearch = async (key) => {
            fetch(`/api/search/${key}`)
                .then(res => res.json())
                .then(data => buildFeed(data.videos))
        }
    
        const getEmpty = () => {
            setFeed(<p>Unrecognized feed type.</p>)
        }

        switch(page) {
            case 'recent': {
                getRecent(10)
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
