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

const Topic = ({classes}) => {

    return(
        <div className={classes.root}>
            Topic
        </div>
    )
}

export default withStyles(styles)(Topic)
