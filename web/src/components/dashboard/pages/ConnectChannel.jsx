import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'

import { useGoogleLogin } from "react-google-login";


const styles = (theme) => ({
    ...theme.typography,
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0',
    },
    error: {
        color: theme.palette.csRed.main,
    },
    csRed: {
        color: 'white',
        backgroundColor: theme.palette.csRed.main,
    }
})

const ConnectChannel = ({classes}) => {

    const CLIENT_ID = '116695775417-h8su8m4k9u9vvkfrssor92st63q0ui3k.apps.googleusercontent.com'

    const responseGoogle = (response) => {
        console.log(response);
    }

    const {signIn} = useGoogleLogin({
        onSuccess: responseGoogle,
        onFailure: responseGoogle,
        clientId: CLIENT_ID,
        isSignedIn: true,
    })

    return (
        <Dialog open={true}>
            <DialogTitle id="form-dialog-title">
                <Typography className={classes.h5}>Connect your YouTube Channel</Typography>
            </DialogTitle>
            <DialogContent>
            </DialogContent>
            <DialogActions>
                <Button onClick={signIn}>Sign In with Google</Button>
            </DialogActions>
        </Dialog>
    )

}

export default withStyles(styles)(ConnectChannel)
