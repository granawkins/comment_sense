import { useState, useEffect, useContext } from 'react';
import { Card, withStyles, Typography } from '@material-ui/core'
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import { ControllerContext } from '../Video'

let styles = () => ({
    default: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignContents: 'flex-start',
        margin: '5px',
        padding: '0',
        backgroundColor: '#f5f5f5',
        height: '100%',
    },
    sentiment: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '10px',
        height: '100%',
        backgroundColor: 'blue',
        zIndex: '10',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        alignContents: 'flex-start',
        margin: '0',
        padding: '5px',
    }
})


const Comment = ({comment, classes}) => {

    let context = useContext(ControllerContext)
    const [sentimentOn, setSentimentOn] = useState(true)
    useEffect(() => {
        setSentimentOn(context.sentimentOn)
    }, [context])

    const [color, setColor] = useState("")
    const [leftPad, setLeftPad] = useState('5px')
    useEffect(() => {
        if (sentimentOn) {
            setLeftPad('20px')
            if (comment.sentiment > 0) {
                setColor('green')
            } else if (comment.sentiment < 0) {
                setColor('red')
            } else {
                setColor('dodgerBlue')
            }
        } else {
            setLeftPad('5px')
        }
    }, [sentimentOn])

    return(
        <Card className={classes.default} >
            {sentimentOn
                ? <div className={classes.sentiment} style={{backgroundColor: `${color}`}}></div>
                : null
            }
            <div className={classes.details} style={{paddingLeft: `${leftPad}`}}>
                <Typography color="secondary">{comment.author}</Typography>
                <Typography dangerouslySetInnerHTML={{__html: comment.text}}></Typography>
                {comment.likes
                    ? <Typography><ThumbUpAltIcon style={{padding: '0px 10px'}}/>{comment.likes}</Typography>
                    : null
                }
            </div>
        </Card>
    )
}

export default withStyles(styles)(Comment)
