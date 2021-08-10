import { useState, useEffect } from 'react'

import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import LoadingCircle from '../../utils/LoadingCircle';

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
    },
    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

const Controller = ({commentsTotal, commentsAnalyzed, analyze,
                     loading, sentimentOn, toggleSentiment, classes}) => {

    const [commentsTarget, setCommentsTarget] = useState(100)
    const updateTarget = (e) => {
        setCommentsTarget(e.target.value)
    }

    return(
        <Container className={classes.root}>
            <Typography className={classes.counter}>
                {commentsAnalyzed} Analyzed / {commentsTotal} Comments
            </Typography>
            <div className={classes.controls}>
                <TextField
                    className={classes.input}
                    onChange={updateTarget}
                    value={commentsTarget}
                    inputProps={{min: 0 }}
                    color="secondary"
                />
                <Button
                    id="apiAnalyzeButton"
                    color='secondary'
                    onClick={() => analyze(commentsTarget)}
                    disabled={loading}
                >Analyze</Button>
                <div style={{width: '50px'}} />
                <Switch
                    checked={sentimentOn}
                    onChange={toggleSentiment}
                    color='secondary'
                />
                <Typography color='black'>Sentiment</Typography>
            </div>
        </Container>
    )
}

export default withStyles(styles)(Controller)
