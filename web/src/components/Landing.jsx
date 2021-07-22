import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

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
        margin: '0',
        paddingTop: '10px',
        width: '100%',
    },
    subHeading: {
        fontFamily: 'Roboto',
        fontWeight: '200',
        fontSize: '1.4rem',
        color: 'red',
        marginTop: '20px',
        textAlign: 'center',
    },
    paper: {
        padding: '30px',
        boxSizing: 'border-box',
    },
    divider: {
        height: '100px',
        width: '100%',
    }
})

const Landing = ({classes}) => {

    return(
        <div className={classes.root}>
            <Splash />
            <div className={classes.divider}/>
            <Paper className={classes.paper} elevation={6}>
                <div className={classes.subHeading}>Search by video, keyword or creator</div>
                <BigSearch />
            </Paper>
            <div className={classes.divider}/>
            <div className={classes.subHeading}>Browse popular videos</div>
            <Popular />
            <div className={classes.divider}/>
            <Paper className={classes.paper} elevation={6}>
                <div className={classes.subHeading}>Connect to see your history & recommendations</div>
                <GoogleLogin />
            </Paper>
            <div className={classes.divider}/>
        </div>
    )
}

export default withStyles(styles)(Landing)
