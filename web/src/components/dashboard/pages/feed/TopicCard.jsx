import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import TopicBar from './TopicBar'
import CommentsBlock from '../Comments'
import Attribute from './Attribute'

const styles = (theme) => ({
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
    },
    topicDetail: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    detail: {
        alignItems: 'center',
        height: '100%',
        margin: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
})

const TopicCard = ({videoId=null, topic, max, classes}) => {

    const [labels, setLabels] = useState(null)
    const [toks, setToks] = useState(null)
    useEffect(() => {
        if (topic.type) {
            setLabels([topic.type].map(label => <Attribute type='label' value={label} />))
        }
        if (topic.toks) {
            setToks(topic.toks.map(tok => <Attribute type='tok' value={tok} />))
        }
    }, [topic])

    const [comments, setComments] = useState(null)
    const getComments = () => {
        if (!comments) {
            setComments(<CommentsBlock videoId={videoId} topic={topic.token} topicComments={topic.comments} />)
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
                    <Typography classes={{root: classes.detail}}>Labels:</Typography>
                    <div className={classes.detail}>{labels}</div>
                    <Typography classes={{root: classes.detail}}>Tokens: </Typography>
                    <div className={classes.detail}>{toks}</div>
                </div>
                {comments}
            </AccordionDetails>
        </Accordion>
    )
}

export default withStyles(styles)(TopicCard)
