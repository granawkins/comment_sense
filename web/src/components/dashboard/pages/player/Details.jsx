import { useState, useEffect } from 'react';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import Typography from '@material-ui/core/Typography';
import { thousands_separator } from '../../../utils/helpers.js'
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    root: {
        padding: '5px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row',
        },
    },
    line: {
        display: 'flex',
        flexDirection: 'row',
    },
})

const Details = ({ videoData, classes }) => {

    const [views, setViews] = useState(0)
    const [published, setPublished] = useState("")
    const [likes, setLikes] = useState(0)
    const [dislikes, setDislikes] = useState(0)
    useEffect(() => {
        if (videoData) {
            setViews(thousands_separator(videoData.views))
            setPublished(videoData.published)
            setLikes(thousands_separator(videoData.likes))
            setDislikes(thousands_separator(videoData.dislikes))
        }
    }, [videoData])

    return(
        <div className={classes.root}>
            <div className={classes.line}>
                <VisibilityIcon style={{padding: '0px 10px'}}/>
                <Typography noWrap={true}>
                    {views}
                </Typography>
            </div>
            <div className={classes.line}>
                <ScheduleIcon style={{padding: '0px 10px'}}/>
                <Typography variant="body1" noWrap={true}>
                    {published}
                </Typography>
            </div>
            <div className={classes.line}>
                <ThumbUpAltIcon style={{padding: '0px 10px'}}/>
                <Typography variant="body1" >
                    {likes}
                </Typography>
                <ThumbDownAltIcon style={{padding: '0px 10px'}}/>
                <Typography variant="body1" >
                    {dislikes}
                </Typography>
            </div>
        </div>
    )
}

export default withStyles(styles)(Details)
