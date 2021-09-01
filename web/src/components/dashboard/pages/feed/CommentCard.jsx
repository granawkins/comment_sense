import { useState, useEffect, useContext } from 'react';
import { Card, withStyles, Typography } from '@material-ui/core'
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import { TopicContext } from '../Topics'

import { thousands_separator, postData } from '../../../utils/helpers'

let styles = (theme) => ({
    ...theme.typography,
    root: {
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignContents: 'flex-start',
        padding: '0',
        marginBottom: theme.spacing(1),
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
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignContents: 'flex-start',
        margin: '0',
        padding: '5px',
    },
    relativeText: {
        textDecoration: 'underline',
        cursor: 'pointer',
    },
    repliesBlock: {
        width: '100%',
        paddingLeft: '50px',
        boxSizing: 'border-box',
    },
})


const CommentCard = ({comment, showRelatives=true, classes}) => {

    const context = useContext(TopicContext)
    const [sentimentOn, setSentimentOn] = useState(true)
    useEffect(() => {
        setSentimentOn(context.display.sentimentOn)
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

    const [repliesVisible, setRepliesVisible] = useState(false)
    const [replies, setReplies] = useState(null)
    const handleReplies = async () => {
        if (!replies) {
            try {
                const response = await postData('/api/comments', {parentId: comment.id, all: true})
                if (response.error) {
                    console.log(`Error getting comment replies: ${response.error}`)
                } else if (response.items) {
                    setReplies(response.items.map(c => <SubComment comment={c} showRelatives={false} />))
                }
            }
            catch(e) {
                console.log(`Error loading comment replies: ${e}`)
            }
        }
        setRepliesVisible(!repliesVisible)
    }

    const [parentVisible, setParentVisible] = useState(false)
    const [parent, setParent] = useState(null)
    const handleParent = async () => {
        if (!parent) {
            try {
                const response = await postData('/api/comments', {commentIds: [comment.parent]})
                if (response.error) {
                    console.log(`Error getting comment parent: ${response.error}`)
                } else if (response.items) {
                    setParent(response.items.map(c => <SubComment comment={c} showRelatives={false} />))
                }
            }
            catch(e) {
                console.log(`Error loading comment parent: ${e}`)
            }
        }
        setParentVisible(!parentVisible)
    }

    return(
        <>
        <Card className={classes.root} >
            {sentimentOn
                ? <div className={classes.sentiment} style={{backgroundColor: `${color}`}}></div>
                : null
            }
            <div className={classes.details} style={{paddingLeft: `${leftPad}`}}>

                {parentVisible
                    ? <>{parent}<div style={{height: '20px'}} /></>
                    : null
                }
                <Typography className={classes.body1}><b>{comment.author}</b></Typography>
                <Typography dangerouslySetInnerHTML={{__html: comment.text}}></Typography>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    {comment.likes
                        ? <Typography className={classes.body1}>
                            <ThumbUpAltIcon style={{fontSize: '1em', padding: '0px 10px'}}/>
                            {thousands_separator(comment.likes)}
                        </Typography>
                        : null
                    }
                    {comment.n_children > 0 && showRelatives
                        ? <>
                            <div style={{width: '10px'}} />
                            <Typography className={`${classes.body1} ${classes.relativeText}`} onClick={handleReplies}>
                                {comment.n_children} {comment.n_children > 1 ? 'replies' : 'reply'}
                            </Typography>
                        </>
                        : null
                    }
                    {comment.parent && showRelatives
                        ? <>
                            <div style={{width: '10px'}} />
                            <Typography className={`${classes.body1} ${classes.relativeText}`} onClick={handleParent}>
                                Replying to..
                            </Typography>
                        </>
                        : null
                    }
                </div>
                {repliesVisible
                    ? <>{replies}<div style={{height: '5px'}} /></>
                    : null
                }
            </div>
        </Card>
        </>
    )
}

export default withStyles(styles)(CommentCard)

const SubComment = withStyles(styles)(CommentCard)
