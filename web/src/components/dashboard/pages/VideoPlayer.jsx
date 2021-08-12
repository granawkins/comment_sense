import { useEffect, useState, useRef, useCallback } from 'react'
import { withStyles } from '@material-ui/core/styles';
import debounce from 'lodash.debounce'

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import CardMedia from '@material-ui/core/CardMedia';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';

import LoadingCircle from '../../utils/LoadingCircle';
import { numberWithCommas, formatTimestamp } from '../../utils/helpers';

const styles = (theme) => ({
    ...theme.typography,
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: '0',
    },
    video: {
        width: '100%',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    videoBackground: {
        width: '100%',
        backgroundColor: 'black',
    },
    details: {
        padding: '10px',
        boxSizing: 'border-box',
        height: 'auto',
        width: '100%',
    },
    line: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    },
    pair: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
})

const VideoPlayer = ({video, classes}) => {

    useEffect(() => {
        window.addEventListener('resize', handleResize)
    }, [])

    const background = useRef(null)
    const player = useRef(null)
    const handleResize = useCallback(
        debounce(() => {
            if (background.current) {
                const width = background.current.offsetWidth
                background.current.style.height = Math.ceil(width / 16 * 9) + "px"
                if (player) {
                    player.current.style.height = Math.ceil(width / 16 * 9) + "px"
                }
            }
        }, 200)
    )
    useEffect(() => {
        handleResize()
    }, [player, background])

    return(
        <Paper className={classes.root}>
            <div ref={background} className={`${classes.video} ${classes.videoBackground}`}>
                {!video
                    ? <LoadingCircle />
                    :  <CardMedia
                        ref={player}
                        component="iframe"
                        className={classes.video}
                        image={"http://youtube.com/embed/" + video.id}
                    />
                }
            </div>
            {video
            ? <div className={classes.details} >
                <Typography className={classes.h6} style={{lineHeight: '1.1', marginBottom: '10px'}}>{video ? video.title : ""}</Typography>
                <div className={classes.line}>
                    <div className={classes.pair}>
                        <VisibilityIcon style={{paddingRight: '10px'}}/>
                        <Typography noWrap={true} className={classes.body1}>
                            {numberWithCommas(video.views)}
                        </Typography>
                    </div>
                    <div className={classes.pair}>
                        <ScheduleIcon style={{paddingRight: '10px'}}/>
                        <Typography className={classes.body1} noWrap={true}>
                            {formatTimestamp(video.published)}
                        </Typography>
                    </div>
                    <div className={classes.pair}>
                        <ThumbUpAltIcon style={{paddingRight: '10px'}}/>
                        <Typography className={classes.body1} >
                            {numberWithCommas(video.likes)}
                        </Typography>
                        <ThumbDownAltIcon style={{padding: '0px 10px'}}/>
                        <Typography className={classes.body1} >
                            {numberWithCommas(video.dislikes)}
                        </Typography>
                    </div>
                </div>
            </div>
            : null
            }
        </Paper>
    )
    // }
}

export default withStyles(styles)(VideoPlayer)
