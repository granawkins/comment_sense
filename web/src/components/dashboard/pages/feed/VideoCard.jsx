import { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import { postData, formatTimestamp } from '../../../utils/helpers';

const styles = (theme) => ({
    ...theme.typography,
    root: {
        height: '100%',
        padding: '0',
        margin: '10px 0 0 0',
        boxSizing: 'border-box',
        width: '100%',
    },
    link: {
        width: '100%',
        height: '100%',
        color: 'inherit',
        textDecoration: 'none',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
        gridAutoRows: '1fr',
        [theme.breakpoints.up('md')]: {
            gridTemplateColumns: '1fr 1fr 1fr',
            gridAutoRows: '1fr',
        },
    },
    cover: {
        gridColumn: '1 / span 2',
        height: 'auto',
        marginBottom: '0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.up('md')]: {
            gridColumn: '1 / span 1'
        },

    },
    details: {
        height: '100%',
        gridColumn: '3 / span 3',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '2px 8px',
        boxSizing: 'border-box',
        fontSize: '90%',
        [theme.breakpoints.up('md')]: {
            gridColumn: '2 / span 2',
            padding: '8px 16px',
            fontSize: '100%',
        },
    },
    actionArea: {
        alignItems: 'flex-start',
        fontSize: '1em',
        margin: '0',
        padding: '0',
        height: '100%',
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    csRed: {
        color: theme.palette.csRed.main
    },
})

const VideoCard = ({video, classes}) => {

    const [pageUrl, setPageUrl] = useState("#")
    useEffect(() => {
        console.log(video)
        setPageUrl("../dashboard/video/" + video.id)
    }, [])

    return (
        <Card className={classes.root}>
            <CardActionArea className={classes.actionArea}>
                <Link to={pageUrl} className={classes.link}>
                    <div className={classes.cover}>
                        {video.thumbnail
                            ? <CardMedia
                                component='img'
                                src={video.thumbnail}
                                title={video.title}
                            />
                            : null
                        }
                    </div>
                    <div className={classes.details}>
                        <Typography noWrap className={classes.h6} dangerouslySetInnerHTML={{__html: video.title}}></Typography>
                        <Typography className={classes.body1}>{formatTimestamp(video.published, 'date')}</Typography>
                        {video.db_comments > 0
                            ? <Typography className={`${classes.body1} ${classes.csRed}`}>
                                {video.db_comments} comments analyzed
                            </Typography>
                            : null
                        }
                    </div>
                </Link>
            </CardActionArea>
        </Card>
    )
}

export default withStyles(styles)(VideoCard)
