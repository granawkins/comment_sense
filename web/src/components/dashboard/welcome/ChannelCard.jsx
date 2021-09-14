import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import { thousands_separator } from '../../utils/helpers';

const styles = (theme) => ({
    ...theme.typography,
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: '80px',
        padding: '10px',
        boxSizing: 'border-box',
    },
    cover: {
        height: '60px',
        width: '60px',
    },
    avatar: {
        borderRadius: '50%',
    },
    details: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '0 8px',
        boxSizing: 'border-box',
    },
    csRed: {
        color: theme.palette.csRed.main
    },
})

const ChannelCard = ({channel, connectChannel, classes}) => {
    /*
    channels = [{
        id: '..',
        thumbnail: 'url',
        title: '..',
        total_videos: N,
        uploads_playlist: '..',
    }]
    */

    const handleConnect = () => {
        connectChannel(channel)
    }

    return (
        <Card>
            <CardActionArea onClick={handleConnect}  className={classes.root}>
                <div className={classes.cover}>
                    {channel.thumbnail
                        ? <CardMedia
                            className={classes.avatar}
                            component='img'
                            src={channel.thumbnail}
                            title="channel thumbnail"
                        />
                        : null
                    }
                </div>
                <div className={classes.details}>
                    <Typography noWrap className={classes.h6} dangerouslySetInnerHTML={{__html: channel.title}}></Typography>
                    <Typography className={classes.body1}>{thousands_separator(channel.total_videos)} videos</Typography>
                </div>
            </CardActionArea>
        </Card>
    )
}

export default withStyles(styles)(ChannelCard)
