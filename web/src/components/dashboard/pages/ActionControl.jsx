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

import RedSwitch from '../../utils/RedSwitch'
import { thousands_separator } from '../../utils/helpers'

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

const ActionControl = ({isOpen, handleClose, actionTitle, remaining, quota, verb,
                        actionLabel, action, classes}) => {

    const [max, setMax] = useState(100)
    const [maxError, setMaxError] = useState(null)
    const [resetToken, setResetToken] = useState(false)
    const handleMax = (e) => {
        let target = e.target.value
        if (target > remaining && !resetToken) {
            target = remaining
            setMaxError("Target must be less than remaining")
        } else if (target > quota) {
            target = quota
            setMaxError("Target must be less than quota")
        } else {
            setMaxError(null)
        }
        setMax(target)
    }

    // Create a popup menu with details/options for analyze
    const handleActionConfirm = () => {
        action(max, resetToken)
        handleClose()
    }
    const handleActionClose = () => {
        handleClose()
    }

    return (
        <Dialog open={isOpen} onClose={handleActionClose}>
            <DialogTitle id="form-dialog-title">
                <Typography className={classes.h5}>{actionTitle}</Typography>
            </DialogTitle>
            <DialogContent>
                <div className={classes.row}>
                    <Typography className={classes.body1}>Remaining:</Typography>
                    <Typography className={classes.body1}>
                        {thousands_separator(remaining)}
                    </Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.body1}>Quota:</Typography>
                    <Typography className={classes.body1}>
                        {thousands_separator(quota)}
                    </Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.body1}>Number to {verb}:</Typography>
                    <TextField
                        autoFocus
                        margin="none"
                        id="actionText"
                        type="tel"
                        inputProps={{min: 0,style: {width: '100px', textAlign: 'right'}}}
                        onChange={handleMax}
                        value={max}
                    />
                </div>
                {maxError
                    ? <Typography className={classes.error}>{maxError}</Typography>
                    : null
                }
                <div className={classes.row}>
                    <Typography className={classes.body1}>Restart from Oldest:</Typography>
                    <RedSwitch
                        checked={resetToken}
                        onChange={() => setResetToken(!resetToken)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleActionClose} variant="contained" color="primary">
                CANCEL
            </Button>
            <Button onClick={handleActionConfirm} variant="contained" className={classes.csRed}>
                {actionLabel}
            </Button>
            </DialogActions>
        </Dialog>
    )

}

export default withStyles(styles)(ActionControl)
