import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import Splash from './Landing/Splash.jsx'
import BigSearch from './Landing/BigSearch.jsx'
import GoogleLogin from './Landing/GoogleLogin.jsx'
import Popular from './Landing/Popular.jsx'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        margin: '0',
        paddingTop: '10px',
        width: '100%',
    },
})

const Landing = ({classes}) => {
    
    return(
        <div className={classes.root}>
            <Splash />
            <BigSearch />
            <GoogleLogin />
            <Popular />
        </div>
    )
}

export default withStyles(styles)(Landing)
