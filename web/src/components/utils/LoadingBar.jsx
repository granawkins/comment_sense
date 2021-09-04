import { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { fade } from '@material-ui/core/styles/colorManipulator'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: fade(theme.palette.primary.main, 0.5),
    },
    barLoader: {
        height: '5px',
        width: '100%',
    },
    bar: {
        backgroundColor: theme.palette.csRed.main
    },
})

const LoadingBar = ({loadTime=null, classes}) => {

    const TIME_STEP = 500 // ms
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(prevElapsed => prevElapsed + TIME_STEP)
        }, TIME_STEP);
        return () => {
              clearInterval(timer);
        }
    }, [])

    const [progress, setProgress] = useState(0)
    useEffect(() => {
        const targetTime = loadTime ? loadTime : 5
        const loadRatio = elapsed / (targetTime * 1000)
        const cleanRatio = Math.round(loadRatio * 100)
        if (cleanRatio >= 99) {
            setProgress(99)
        } else {
            setProgress(cleanRatio)
        }
    }, [elapsed])

    return (
        <div className={classes.root}>
            <LinearProgress
                className={classes.barLoader}
                classes={{bar: classes.bar}}
                variant='determinate'
                value={progress}
            />
        </div>
    )
}

export default withStyles(styles)(LoadingBar)
