import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { postData } from '../../utils/helpers'

const styles = (theme) => ({
    root: {
        display: 'flex',
        minHeight: '100%',
        flexDirection: 'column',
        alignItems: 'left',
        backgroundColor: '#f5f5f5',
        margin: '0',
        paddingTop: '10px',
    },
})

const BlogEditor = ({classes}) => {

    return(
        <Typography>Blog</Typography>
    )
}

export default withStyles(styles)(BlogEditor)
