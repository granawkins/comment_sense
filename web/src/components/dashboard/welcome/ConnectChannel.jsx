import { useState, useEffect } from 'react'
// import { useAuth0 } from '@auth0/auth0-react'
import { withStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'

import ChannelCard from './ChannelCard'
import ErrorPage from '../../utils/ErrorPage'
import LoadingCircle from '../../utils/LoadingCircle'
import { postData } from '../../utils/helpers'

// import { gapi, loadAuth2 } from 'gapi-script'

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

const ConnectChannel = ({user, setUser, classes}) => {
    const history = useHistory()

    // 1. Get a list of channels
    //    a) text-input username, get by username
    //    b) OAuth 2 token, get mine=true
    const [username, setUsername] = useState(null)
    const handleUsername = e => {
        setUsername(e.target.value)
    }

    const [channels, setChannels] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const getChannels = async () => {
        setIsLoading(true)
        try {
            const response = await postData('/api/get_channels', {username})
            if (response.error || !response.channels) {
                setHasError(true)
                console.log(response.error)
                setIsLoading(false)
            }
            else {
                setChannels(response.channels)
                setIsLoading(false)
            }
        }
        catch {
            console.log('error loading channels')
            setIsLoading(false)
        }
    }

    // 2. Select channel
    // 3. Update user, redirect back to dashboard
    const connectChannel = async (channel) => {
        setIsLoading(true)
        try {
            const response = await postData('/api/set_channel', {user, channel})
            setUser({...user, channelId: channel.id})
            history.go(0)
        }
        catch {
            console.log("Error connecting channel")
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={true}>
            <DialogTitle id="form-dialog-title">
                <Typography className={classes.h5}>Connect your YouTube Channel</Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="none"
                    type="text"
                    id="username"
                    placeholder="Enter YouTube username"
                    // inputProps={{min: 0,style: {width: '50px', textAlign: 'right'}}}
                    className={classes.body1}
                    onChange={handleUsername}
                    value={username}
                />
                <Button onClick={getChannels}>GET CHANNELS</Button>
                {isLoading && <LoadingCircle />}
                {hasError && <ErrorPage />}
                {channels && channels.map(channel => {
                    return <ChannelCard channel={channel} connectChannel={connectChannel} />
                })}
            </DialogContent>
            {/* <DialogActions>
                <Button onClick={() => {}}>Sign In with Google</Button>
                <Button onClick={logout}>Logout</Button>
            </DialogActions> */}
        </Dialog>
    )

}

export default withStyles(styles)(ConnectChannel)






    // const CLIENT_ID = '116695775417-h8su8m4k9u9vvkfrssor92st63q0ui3k.apps.googleusercontent.com'

    // const signIn = async() => {
    //     await window.gapi.auth2.getAuthInstance()
    //             .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
    //     await window.gapi.client.setAPiKey(CLIENT_ID)
    //     const response = await window.gapi.client.youtube.channels.list({
    //         "part": [
    //           "snippet, contentDetails, id, statistics"
    //         ],
    //         "mine": true
    //       })
    //     console.log(response)
    // }

    // // ref: https://github.com/LucasAndrad/gapi-script-live-example/blob/master/src/components/GoogleLogin.js
    // const signIn = async () => {
    //     const auth2 = await loadAuth2(gapi, CLIENT_ID)
    //     if (!auth2.isSignedIn.get()) {
    //         console.log(`auth2 is not signed in`)
    //     }

    //     const authenticate = async () => {
    //         return gapi.auth2.getAuthInstance()
    //             .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
    //             .then(function() { console.log("Sign-in successful"); },
    //                   function(err) { console.error("Error signing in", err); });
    //     }

    //     const loadClient = async () => {
    //         gapi.client.setApiKey("YOUR_API_KEY");
    //         return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    //             .then(function() { console.log("GAPI client loaded for API"); },
    //                 function(err) { console.error("Error loading GAPI client for API", err); });
    //     }

    //     // Make sure the client is loaded and sign-in is complete before calling this method.
    //     function execute() {
    //         return gapi.client.youtube.channels.list({
    //             "part": [
    //                 "snippet, contentDetails, id, statistics"
    //             ],
    //             "mine": true
    //         })
    //             .then(function(response) {
    //                 // Handle the results here (response.result has the parsed body).
    //                 console.log(response);
    //             },
    //             function(err) { console.error("Execute error", err); });
    //       }
    //       authenticate().then(loadClient).then(execute)
    // }

    // const responseGoogle = (response) => {
    //     console.log(response);
    // }

    // const {signIn} = useGoogleLogin({
    //     onSuccess: responseGoogle,
    //     onFailure: responseGoogle,
    //     clientId: CLIENT_ID,
    //     isSignedIn: true,
    // })
