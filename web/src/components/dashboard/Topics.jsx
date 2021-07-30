import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

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
})

const Topics = ({classes}) => {


    // } else if (type === 'topics') {
    //     let newMax = Math.max(maxScore, items[0].score)
    //     setMaxScore(newMax)
    //     setFeed(feed => [...feed, items.map(t => {
    //         return <TopicCard videoId={videoId} topic={t} max={newMax} key={t.token} type={type} />
    //     })])
    // }

    return(
        <div className={classes.root}>
            Topics
        </div>
    )
}

export default withStyles(styles)(Topics)
