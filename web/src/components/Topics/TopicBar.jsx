import { Box, withStyles, Typography } from '@material-ui/core'

const styles = () => ({
    bar: {
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: 'dodgerBlue',
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
    }
})

const TopicBar = ({token, score, barRatio, classes}) => {

    let displayToken = (token.length > 25) ? token.slice(0, 25) + "..." : token

    return(
        <div style={{width: "100%"}}>
            <Box className={classes.bar} width={Math.round(barRatio*100) + "%"}/>
            <div className={classes.label}>
                <Typography variant='h6' className={classes.token}>{displayToken}</Typography>
                <Typography variant='h6' className={classes.score}>{score}</Typography>
            </div>
        </div>
    )
}

export default withStyles(styles)(TopicBar)
