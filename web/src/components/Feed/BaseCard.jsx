import React from 'react'
import { Link, withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

const styles = (theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        borderRadius: '0',
        padding: '0',
        margin: '10px 0 0 0',
        boxSizing: 'border-box',
        [theme.breakpoints.up('sm')]: {
            width: '480px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    },
    link: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        textDecoration: 'none',
        color: 'inherit',
    },
    cover: {
        height: '80px',
        width: 'auto',
        [theme.breakpoints.up('sm')]: {
            height: '120px',
        },
        marginBottom: '0',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        top: '0',
        margin: '8px',
        padding: '1px 5px',
    },
    title: {
        top: '0',
        margin: '0',
        lineHeight: '1',
        fontSize: '1.0em',
        [theme.breakpoints.up('sm')]: {
            fontSize: '1.1em',
        },
    },
    faint: {
        color: '#757575',
        fontSize: '0.8em',
        [theme.breakpoints.up('sm')]: {
            fontSize: '0.9em',
        },
    },
    actionArea: {
        alignItems: 'flex-start',
        fontSize: '1em',
        margin: '0',
        padding: '0',
    }
})

const BaseCard = ({channel, classes}) => {

    return (
        <Link to={"../video/" + channel.channelId} className={classes.link}>
            <Card className={classes.root}>
                <CardMedia
                    className={classes.cover}
                    component='img'
                    src={channel.thumbnail}
                    title={channel.channelTitle}
                    />
                <CardActionArea className={classes.actionArea}>
                <div className={classes.details}>
                    <Typography 
                        className={classes.channelTitle} 
                        dangerouslySetInnerHTML={{__html: channel.channelTitle}}
                    >
                    </Typography>
                    <Typography className={classes.faint}>{channel.description}</Typography>
                </div>
                </CardActionArea>
            </Card>
        </Link>
    )
}

export default withStyles(styles)(BaseCard)
