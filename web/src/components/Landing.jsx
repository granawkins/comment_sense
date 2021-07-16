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
    subHeading: {
        fontFamily: 'Roboto',
        fontWeight: '200',
        fontSize: '1.4rem',
        color: 'red',
        marginTop: '100px',
        textAlign: 'center',
    }
})

const Landing = ({classes}) => {
    
    return(
        <div className={classes.root}>
            <Splash />
            <div className={classes.subHeading}>Search by video, keyword or creator</div>
            <BigSearch />
            <div className={classes.subHeading}>Browse popular videos</div>
            <Popular />
            <div className={classes.subHeading}>Connect to see your history & recommendations</div>
            <GoogleLogin />
            <div style={{marginBottom: '100px'}} />
        </div>
    )
}

export default withStyles(styles)(Landing)
