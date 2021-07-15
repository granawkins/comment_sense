import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';

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

const GoogleLogin = ({classes}) => {
    
    const handleLogin = () => {
        console.log("Login with Google")
    }

    return(
        <div className={classes.root}>
            <Typography variant='h6'>
                Connect to see your history and recommendations
            </Typography>
            <Button 
                id="loginWithGoogle" 
                color='secondary' 
                onClick={() => handleLogin()}
            >Login with Google</Button>
        </div>
    )
}

export default withStyles(styles)(GoogleLogin)

