import { useState, useEffect } from 'react';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import Typography from '@material-ui/core/Typography';
import { thousands_separator } from '../../../utils/helpers.js'
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    ...theme.typography,
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

const Details = ({ video, classes }) => {

    return(
        <div className={classes.root}>
            <div className={classes.line}>
                <VisibilityIcon style={{paddingLeft: '10px'}}/>
                <Typography noWrap={true} className={classes.body1}>
                    {video.views}
                </Typography>
            </div>
            <div className={classes.line}>
                <ScheduleIcon style={{padding: '0px 10px'}}/>
                <Typography className={classes.body1} noWrap={true}>
                    {video.published}
                </Typography>
            </div>
            <div className={classes.line}>
                <ThumbUpAltIcon style={{padding: '0px 10px'}}/>
                <Typography className={classes.body1} >
                    {video.likes}
                </Typography>
                <ThumbDownAltIcon style={{padding: '0px 10px'}}/>
                <Typography className={classes.body1} >
                    {video.dislikes}
                </Typography>
            </div>
        </div>
    )
}

export default withStyles(styles)(Details)
