import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import TopicBar from './TopicBar'
import CommentsBlock from './CommentsBlock'

const styles = (theme) => ({
    root: {
        width: '100%',
        borderRadius: '0',
        padding: '0',
        margin: '10px 0 0 0',
        boxSizing: 'border-box',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    },
    detail: {
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
})

const TopicCard = ({topic, max, classes}) => {

    const [comments, setComments] = useState(null)
    const getComments = () => {
        if (!comments) {
            console.log(topic)
            setComments(<CommentsBlock topicComments={topic.comments} />)
        }
    }

    return (
        <Accordion className={classes.root} onChange={getComments}>
            <AccordionSummary className={classes.summary}>
                <TopicBar 
                    token={topic.token} 
                    score={topic.score}
                    barRatio={topic.score/max} 
                />
            </AccordionSummary>
            <AccordionDetails className={classes.detail}>
                {comments}
            </AccordionDetails>
        </Accordion>
    )
}

export default withStyles(styles)(TopicCard)
