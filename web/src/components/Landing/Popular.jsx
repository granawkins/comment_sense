import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        margin: '0',
        padding: '40px 0',
        width: 'auto',
    },
})

const Popular = ({classes}) => {

    return(
        <div className={classes.root}>
            <Typography variant='h6'>
                Browse popular videos
            </Typography>
        </div>
    )
}

export default withStyles(styles)(Popular)
