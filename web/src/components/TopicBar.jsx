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
        justifyContent: 'space-between'
    },
    text: {
        zIndex: 1,
    }
})

const TopicBar = ({token, score, barRatio, classes}) => {

    return(
        <div style={{width: "100%"}}>
            <Box className={classes.bar} width={Math.round(barRatio*100) + "%"}/>
            <div className={classes.label}>
                <Typography variant='h6' className={classes.text}>{token}</Typography>
                <Typography variant='h6' className={classes.text}>{score}</Typography>
            </div>
        </div>
    )
}

export default withStyles(styles)(TopicBar)
