import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TimerIcon from '@material-ui/icons/Timer';
import Button from '@material-ui/core/Button';

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap',
        margin: '0',
        padding: '20px',
        width: '100%',
    },
    comingSoon: {
        color: 'gray',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px',
        fontSize: '0.9em',
    }
})

const GoogleLogin = ({classes}) => {

    const handleLogin = () => {
        console.log("Login with Google")
    }

    return(
        <div className={classes.root}>
            <Button
                id="loginWithGoogle"
                variant='contained'
                color='secondary'
                disabled='true'
                onClick={() => handleLogin()}
            >Login with Google</Button>
            <Typography className={classes.comingSoon}>
                <TimerIcon style={{fontSize: '1.3em'}}/>
                COMING SOON
            </Typography>
        </div>
    )
}

export default withStyles(styles)(GoogleLogin)

