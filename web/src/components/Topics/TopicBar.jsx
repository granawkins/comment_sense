import { useContext, useState, useEffect } from 'react'
import { Box, withStyles, Typography } from '@material-ui/core'
import { ControllerContext } from '../Video'

const styles = () => ({
    bar: {
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: '#8EC9FF',
        zIndex: 0,
    },
    label: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 'inherit',
        overflow: 'hidden',
    },
    token: {
        zIndex: 1,
        flex: 1,
        minWidth: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    score: {
        zIndex: 1,
    },
    sentiment: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        height: '5px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    pos: {
        height: '100%',
        backgroundColor: 'green',
    },
    neg: {
        height: '100%',
        backgroundColor: 'red',
    },
    neu: {
        height: '100%',
        backgroundColor: 'dodgerblue',
    },
})

const TopicBar = ({token, score, max, sentiment, classes}) => {

    let context = useContext(ControllerContext)
    const [sentimentOn, setSentimentOn] = useState(true)
    useEffect(() => {
        setSentimentOn(context.sentimentOn)
    }, [context])

    const [xScore, setXScore] = useState(0)
    const [xPos, setXPos] = useState(0)
    const [xNeg, setXNeg] = useState(0)
    const [xNeu, setXNeu] = useState(0)
    useState(() => {
        if (!sentiment) {
            return
        }
        setXScore(Math.round((score/max)*100))
        setXPos(Math.round((sentiment.pos/max)*100))
        setXNeg(Math.round((sentiment.neg/max)*100))
        setXNeu(Math.max(Math.round((sentiment.neu/max)*100), xScore - xPos - xNeg))
    }, [score, max, sentiment])

    let displayToken = (token.length > 25) ? token.slice(0, 25) + "..." : token

    return(
        <div style={{width: "100%"}}>
            <Box className={classes.bar} width={xScore + "%"}/>
            {sentimentOn
                ? <div className={classes.sentiment}>
                    <Box className={classes.pos} width={xPos + "%"}/>
                    <Box className={classes.neg} width={xNeg + "%"}/>
                    <Box className={classes.neu} width={xNeu + "%"}/>
                </div>
                : null
            }
            <div className={classes.label}>
                <Typography variant='h6' className={classes.token}>{displayToken}</Typography>
                <Typography variant='h6' className={classes.score}>{score}</Typography>
            </div>
        </div>
    )
}

export default withStyles(styles)(TopicBar)
