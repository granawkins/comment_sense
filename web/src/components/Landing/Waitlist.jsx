import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'


const styles = (theme) => ({
    ...theme.typography,
    error: {
        color: theme.palette.csRed.main,
    },
    csRed: {
        color: 'white',
        backgroundColor: theme.palette.csRed.main,
    }
})

// Check if string is valid email address. ref: https://stackoverflow.com/a/46181
const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase())
}

const Waitlist = ({isOpen, setIsOpen, classes}) => {

    // What to do with a valid address
    const submit = () => {
        console.log(email)
    }

    // Handle button clicks
    const [invalid, setInvalid] = useState(false)
    const handleActionSubmit = () => {
        if (!validateEmail(email)) {
            setInvalid(true)
        } else {
            submit()
            setIsOpen(false)
        }
    }
    const handleActionClose = () => {
        setIsOpen(false)
    }

    // Update email variable while you type
    const [email, setEmail] = useState("")
    const handleEmail = (e) => {
        setEmail(e.target.value)
        // Turn off the error message after they've updated it
        if (invalid) {
            setInvalid(false)
        }
    }

    // Pressing enter clicks 'submit'
    const listenEnter = (e) => {
        if (e.key === 'Enter') {
            handleActionSubmit()
        }
    }
    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', listenEnter)
        } else {
            window.removeEventListener('keydown', listenEnter)
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onClose={handleActionClose}>
            <DialogTitle id="form-dialog-title">
                <Typography className={classes.h5}>Join Waitlist</Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    error={invalid ? true : false}
                    helperText={invalid ? "Enter a valid email address" : ""}
                    autoFocus
                    placeholder="Enter email address"
                    margin="none"
                    type="email"
                    onChange={handleEmail}
                    value={email}
                />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleActionClose} variant="contained" color="primary">
                CANCEL
            </Button>
            <Button type="submit" onClick={handleActionSubmit} variant="contained"
                    className={classes.csRed}>
                SUBMIT
            </Button>
            </DialogActions>
        </Dialog>
    )

}

export default withStyles(styles)(Waitlist)
