import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { useHistory, useParams } from 'react-router'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'

import LoadingCircle from './utils/LoadingCircle'
import { postData } from './utils/helpers'

const styles = (theme) => ({
    ...theme.typography,
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        margin: '5px 0',
    },
    head: {
        margin: '0',
    },
    bold: {
        fontWeight: '600',
    },
    error: {
        color: theme.palette.csRed.main,
    },
    csRed: {
        color: 'white',
        backgroundColor: theme.palette.csRed.main,
    },
    centered: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
})

const Login = ({page=null, classes}) => {
    const params = useParams()
    const [username, setUsername] = useState("")
    const [inputUsername, setInputUsername] = useState(true)
    const [title, setTitle] = useState("")
    const handleUsername = (e) => {
        setUsername(e.target.value)
    }
    useEffect(() => {
        if (page) {
            setUsername(page)
            setInputUsername(false)
            setTitle("Login to " + page)
        } else if (params.username) {
            setUsername(params.username)
            setInputUsername(false)
            setTitle("Login to " + params.username)
        } else {
            setTitle("Login")
        }
    }, [])

    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [rejected, setRejected] = useState(false)
    const handlePassword = (e) => {
        setPassword(e.target.value)
        if (rejected) {
            setRejected(false)
        }
    }

    const history = useHistory()
    const handleLogin = async () => {
        setIsLoading(true)

        // Send to backend for verification
        const response = await postData('/api/login', {username, password})

        if (!response.user) {
            // If incorrect, show rejected
            setRejected(true)
            setIsLoading(false)
        } else {
            // If correct, add userData to localStorage and go to page
            localStorage.setItem('userData', JSON.stringify(response.user))
            if (page) {
                history.go(0) // /admin just refreshes
            } else {
                history.push('../dashboard') // /u pages redirect to dashboard
            }
        }
    }

    const loginForm = (
        <>
            {!inputUsername ? null :
                <div className={`${classes.row} ${classes.head}`}>
                    <Typography className={classes.body1}>Username:</Typography>
                    <TextField
                        autoFocus
                        margin="none"
                        type="text"
                        inputProps={{min: 0,style: {width: '100px', textAlign: 'right'}}}
                        className={classes.body1}
                        onChange={handleUsername}
                        value={username}
                    />
                </div>
            }
            <div className={`${classes.row} ${classes.head}`}>
                <Typography className={classes.body1}>Password:</Typography>
                <TextField
                    autoFocus
                    margin="none"
                    type="password"
                    inputProps={{min: 0,style: {width: '100px', textAlign: 'right'}}}
                    className={classes.body1}
                    onChange={handlePassword}
                    value={password}
                />
            </div>
            <div className={classes.row}>
                {rejected
                    ? <Typography className={classes.error}>
                        Incorrect password. Please try again.
                    </Typography>
                    : null
                }
            </div>
        </>
    )

    return (
        <Dialog open>
            <DialogTitle className={classes.centered}>{title}</DialogTitle>
            <DialogContent>
                {isLoading
                    ? <LoadingCircle />
                    : loginForm
                }
            </DialogContent>
            <DialogActions className={classes.centered}>
                <Button onClick={handleLogin} variant="contained" className={classes.csRed}>
                    LOGIN
                </Button>
            </DialogActions>
        </Dialog>
    )

}

export default withStyles(styles)(Login)
