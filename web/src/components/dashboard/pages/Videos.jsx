import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Typography, Button } from '@material-ui/core'

import Controller from './Controller'
import Feed from './feed/Feed'
import FeedCard from './feed/FeedCard'
import { postData } from '../../utils/helpers'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        // display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
    scanBlock: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    scanNow: {
        backgroundColor: theme.palette.csRed.main,
        color: 'white',
        top: '0',
        marginLeft: '20px',
    },
})

const Videos = ({user, channel, classes}) => {

    // const videoId = useParams().videoId
    const [pageLoading, setPageLoading] = useState(false)
    const [nScanned, setNScanned] = useState(null)
    const [nTotal, setNTotal] = useState(null)
    useEffect(() => {
        if (channel) {
            ['videos', 'topics'].forEach(section => {
                if (typeof(channel[section]) === 'string') {
                    channel[section] = JSON.parse(channel[section])
                }
            })
            setNTotal(channel.n_total)
            setNScanned(channel.videos.length)
        }
    }, [channel])

    const [isEmpty, setIsEmpty] = useState(false)
    const [hasError, setHasError] = useState(false)
    const scanVideos = async () => {
        setPageLoading(true)
        try {
            const response = await postData('/api/get_youtube_videos', {
                user,
                publishedAfter: null,
                maxVideos: 100,
                fromMostRecent: false,
            })
            const {n_scanned, n_total, end, error} = response
            setNScanned(n_scanned)
            setNTotal(n_total)
            setPageLoading(false)
        }
        catch {
            setHasError(true)
            setPageLoading(false)
        }
    }

    const [control, setControl] = useState(null)
    useEffect(() => {
        setControl({search: "", sort: "recent"})
    }, [])

    const query = {
        api: '/api/videos',
        data: {user, pageSize: 10},
    }
    const render = (video) => {
        return <FeedCard type='video' data={video} key={video.id} />
    }

    if (hasError || isEmpty) {
        return (
            <div>Empty</div>
        )
    } else {
        return(
            <div className={classes.root}>
                <div className={classes.scanBlock}>
                    <Typography className={classes.body1}>{nScanned} scanned / {nTotal} videos</Typography>
                    <Button
                        onClick={scanVideos}
                        className={classes.scanNow}
                        variant='contained'
                    >SCAN NOW</Button>
                </div>
                {!control ? null : <Controller type='videos' control={control} setControl={setControl} />}
                {pageLoading || !control ? null : <Feed query={query} control={control} render={render} />}
            </div>
        )
    }
}

export default withStyles(styles)(Videos)
