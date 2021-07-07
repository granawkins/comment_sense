import { Box, withStyles, Typography } from '@material-ui/core'
import { useState, useEffect } from 'react'

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

const TopicBar = (props) => {

    const [barWidth, setBarWidth] = useState(0)

    useEffect(() => {
        setBarWidth(100)
    }, [])

    return(
        <div style={{width: "100%"}}>
            <Box className={props.classes.bar} width={Math.round(props.barRatio*100) + "%"}/>
            <div className={props.classes.label}>
                <Typography variant='h6' className={props.classes.text}>{props.token}</Typography>
                <Typography variant='h6' className={props.classes.text}>{props.score}</Typography>
            </div>
        </div>
    )
}

export default withStyles(styles)(TopicBar)