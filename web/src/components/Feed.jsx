import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FeedCard from "./FeedCard.jsx"
// import { initiateSocket, disconnectSocket, recent } from './sock'
// import io from 'socket.io-client'
import { socket } from '../App'

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


const Feed = ({page, host}) => {
    const classes = useStyles();
    const [feed, setFeed] = useState([])
    const key = useParams().key
    
    // var socket    

    useEffect(() => {
        buildPage(page)
        // socket = io(host, {transports: ['websocket']});
        // socket.on('connect', () => {
        //     console.log("Connected")
        //     buildPage(page)
        // })
        // socket.on('disconnect', () => {
        //     console.log("Disconnected")
        // })
    }, [])

    const buildPage = (type) => {
        switch(type) {
            case 'recent' : getRecent(10); break;
            case 'search' : getSearch(key); break;
        }
    }
    
    const getRecent = (num) => {
        socket.emit('recent', {n: num}, (result) => {
            buildFeed(result.videos)
        })
    }

    const getSearch = (key) => {
        socket.emit('search', {key: key}, (result) => {
            buildFeed(result.videos)
        })
    }

    // fetch(`/api/recent/${n}`)
        // .then(res => res.json())
        // .then(data => {buildFeed(data.database_videos)})

    // const getSearch = () => {
    //     fetch(`../api/search/${key}`)
    //     .then(res => res.json())
    //     .then(data => {buildFeed(data.youtube_videos)})
    // }

    const buildFeed = (video_data) => {
        setFeed(video_data.reverse().map(video => <FeedCard video={video} />))
    }

    return(
        <Grid container className={classes.root} direction="column">
            {feed}
        </Grid>
    )
}

export default Feed