import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import TopicBar from './TopicBar'
import Comments from '../Comments'
import Attribute from './Attribute'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        width: '100%',
        borderRadius: '0',
        padding: '0',
        margin: '10px 0 0 0',
        boxSizing: 'border-box',
    },
    accordian: {
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '10px',
        boxSizing: 'border-box',
    },
    topicDetail: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    detail: {
        alignItems: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    comments: {
        maxHeight: '400px',
        overflow: 'auto',
    }
})

const TopicCard = ({videoId=null, topic, max, sentimentOn=false, classes}) => {

    const [commentIds, setCommentIds] = useState(null)
    const [videoIds, setVideoIds] = useState(null)
    const [labels, setLabels] = useState(null)
    const [toks, setToks] = useState(null)
    const getComments = () => {
        if (!commentIds) {
            if (videoId) {
                setLabels(<Attribute type='label' value={topic.label} />)
                setCommentIds(topic.comments)
            } else {
                setLabels(<Attribute type='label' value={topic.label} />)
                setVideoIds(topic.videos.map(v => v[0]))
                let newCommentIds = []
                topic.videos.forEach(v => {
                    newCommentIds.push(...v[1])
                })
                setCommentIds(newCommentIds)
            }
            console.log(topic)
            setToks(topic.toks.map(tok => <Attribute type='tok' value={tok} />))
        }
    }

    return (
        <Accordion className={classes.root} onChange={getComments}>
            <AccordionSummary className={classes.summary}>
                <TopicBar
                    token={topic.token}
                    score={topic.score}
                    max={max}
                    sentiment={topic.sentiment}
                />
            </AccordionSummary>
            <AccordionDetails className={classes.accordian}>
                <div className={classes.topicDetail}>
                    <Typography className={classes.body1}>Label:</Typography>
                    <div className={classes.detail}>{labels}</div>
                    <div style={{width: '30px'}} />
                    <Typography className={classes.body1}>Substitutes: </Typography>
                    <div className={classes.detail}>{toks}</div>
                </div>
                {commentIds
                    ? <div className={classes.comments}>
                        <Comments videoId={videoId} topic={topic.token} commentIds={commentIds} />
                    </div>
                    : null
                }
            </AccordionDetails>
        </Accordion>
    )
}

export default withStyles(styles)(TopicCard)
