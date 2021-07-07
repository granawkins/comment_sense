import { useState, useEffect } from 'react'

import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Loader from './Loader'

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'center',
        width: '100%',
    },
    counter: {
        width: '100%',
        textAlign: 'center',
        margin: '5px',
        fontWeight: '800',
    },
    input: {
        textAlign: 'right',
        margin: '-4px, 10px, 0px, 10px',
        width: '60px',
    }
})

const Controller = ({videoData, progress, analyze, classes}) => {

    const [commentsTotal, setCommentsTotal] = useState(0)
    const [commentsAnalyzed, setCommentsAnalyzed] = useState(0)

    useEffect(() => {
        if (videoData) {
            setCommentsTotal(videoData.comments ? videoData.comments : 0)
            setCommentsAnalyzed(videoData.n_analyzed)
        }
    }, [videoData])

    const [loading, setLoading] = useState(false)
    useEffect(() => {
        if (progress) {
            console.log(progress)
            setCommentsAnalyzed(progress.analyzed)
            if (progress.status === 'done') {
                setLoading(false)
            } else {
                setLoading(true)
            }
            if (progress.error) {
                console.log(`Analyzer aborted: ` + progress.error)
            }
        }
    }, [progress])
    
    const [commentsTarget, setCommentsTarget] = useState(100)
    const updateTarget = (e) => {
        setCommentsTarget(e.target.value)
    }

    return(
        <Container className={classes.root}>
            <Typography className={classes.counter}>
                {commentsAnalyzed} Analyzed / {commentsTotal} Comments
            </Typography>
            {loading
                ? <Loader 
                    target={commentsTarget}
                    progress={progress}
                />
                : <div className={classes.notLoading}>
                    <TextField 
                        className={classes.input}
                        onChange={updateTarget}
                        value={commentsTarget}
                        inputProps={{min: 0 }} 
                        color="secondary"
                    />
                    <Button id="apiAnalyzeButton" color='secondary' onClick={() => analyze(commentsTarget)}>Analyze</Button>
                </div>
            }
        </Container>
    )
}

export default withStyles(styles)(Controller)