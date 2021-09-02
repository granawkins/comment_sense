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
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '30px',
    },
    row: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '300px',
        flexWrap: 'wrap',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row',
        }
    },
    inputLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '5px',
    },
    head: {
        maxWidth: '600px',
        marginBottom: '30px',
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

    return (
        <Dialog open={isOpen} onClose={handleActionClose} fullWidth={true} maxWidth={'sm'}>
            <DialogContent className={classes.root}>
                <div className={`${classes.row} ${classes.head}`}>
                    <Typography className={classes.h6}>
                    {actionTitle}
                    </Typography>
                    <div className={classes.inputLine}>
                        <TextField
                            autoFocus
                            margin="none"
                            id="actionText"
                            type="tel"
                            inputProps={{min: 0,style: {width: '100px', textAlign: 'right'}}}
                            className={classes.h6}
                            onChange={handleMax}
                            value={max}
                        />
                        <Typography className={classes.h6}>
                            / {thousands_separator(remaining)}
                        </Typography>
                    </div>
                    <Button onClick={handleActionConfirm} variant="contained" className={classes.csRed}>
                        GO
                    </Button>
                </div>
                {maxError
                    ? <Typography className={classes.error}>{maxError}</Typography>
                    : null
                }
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
                        {thousands_separator(cost)} / {thousands_separator(quota)} Remaining
                    </Typography>
                </div>
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
            </DialogContent>
        </Dialog>
    )

}

export default withStyles(styles)(ActionControl)
