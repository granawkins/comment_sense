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

    const [cost, setCost] = useState(0) // how much user's quota will be reduced (estimate)
    const [loadtime, setLoadtime] = useState(0) // how many seconds will it take
    useEffect(() => {
        let _maxResults // how many results per youtube api call
        let _perCall // the api quota for one call
        if (verb === 'Analyze') {
            _maxResults = 100
            _perCall = 1
        } else if (verb === 'Scan') {
            _maxResults = 50
            _perCall = 100
        }
        const _nCalls = Math.ceil(max / _maxResults) // est number of calls
        setCost(_nCalls * _perCall)
        setLoadtime(Math.round(5 + _nCalls * 0.9))
    }, [max])

    // Create a popup menu with details/options for analyze
    const handleActionConfirm = () => {
        action(max, resetToken, loadtime)
        handleClose()
    }
    const handleActionClose = () => {
        handleClose()
    }

    return (
        <Dialog open={isOpen} onClose={handleActionClose}>
            <DialogTitle className={classes.centered}>{actionTitle}</DialogTitle>
            <DialogContent>
                <div className={`${classes.row} ${classes.head}`}>
                    <Typography className={classes.body1}>{verb}</Typography>
                    <TextField
                        error
                        autoFocus
                        margin="none"
                        id="actionText"
                        type="tel"
                        inputProps={{min: 0,style: {width: '50px', textAlign: 'right'}}}
                        className={classes.body1}
                        onChange={handleMax}
                        value={max}
                    />
                    <Typography className={classes.body1} style={{marginLeft: '5px'}}>
                        / {thousands_separator(remaining)} remaining
                    </Typography>
                </div>
                {maxError
                    ? <Typography className={classes.error}>{maxError}</Typography>
                    : null
                }
                <div className={classes.row}>
                    <Typography className={classes.body1}>
                        Restart from {verb === 'Scan' ? 'Newest' : 'Oldest'}:
                    </Typography>
                    <RedSwitch
                        size='small'
                        checked={resetToken}
                        onChange={() => setResetToken(!resetToken)}
                    />
                </div>
                <div className={classes.row}>
                    <Typography className={classes.body1}>
                        Est. time:
                    </Typography>
                    <Typography className={`${classes.body1} ${classes.bold}`}>
                        {thousands_separator(loadtime)} seconds
                    </Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.body1}>
                        Quota Cost:
                    </Typography>
                    <Typography className={`${classes.body1} ${classes.bold}`}>
                        {thousands_separator(cost)} / {thousands_separator(quota)}
                    </Typography>
                </div>
            </DialogContent>
            <DialogActions className={classes.centered}>
                <Button onClick={handleActionClose} variant="contained" color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleActionConfirm} variant="contained" className={classes.csRed}>
                    GO
                </Button>
            </DialogActions>
        </Dialog>
    )

}

export default withStyles(styles)(ActionControl)
