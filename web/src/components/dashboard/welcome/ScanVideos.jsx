import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'

const styles = (theme) => ({
    ...theme.typography,
    root: {

    },
    csRed: {
        color: 'white',
        backgroundColor: theme.palette.csRed.main,
    },
})

const ScanVideos = ({close, refresh, loadtime, classes}) => {

    const handleScan = () => {
        close()
        refresh()
    }

    return (
        <Dialog open={true} onClose={close}>
            <DialogContent style={{textAlign: 'center'}}>
                <Typography className={classes.h5}>
                    Welcome to CommentSense!
                </Typography>
                <Typography className={classes.body1}>
                    Scan your YouTube videos to get started.
                    {<br />}
                    Estimated time: {loadtime}s
                </Typography>
            </DialogContent>
            <DialogActions style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <Button onClick={close} variant='contained'>CANCEL</Button>
                <Button onClick={handleScan} variant='contained' className={classes.csRed}>SCAN VIDEOS</Button>
            </DialogActions>
        </Dialog>
    )
}

export default withStyles(styles)(ScanVideos)
