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

const Video = ({classes}) => {

    const renderVideo = (item) => {

    }

    return(
        <div className={classes.root}>
            Video
        </div>
    )
}

export default withStyles(styles)(Video)
