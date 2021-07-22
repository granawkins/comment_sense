import { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import { postData } from '../../utils/helpers';

const styles = (theme) => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
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
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        textDecoration: 'none',
        color: 'inherit',
    },
    cover: {
        width: '40%',
        height: 'auto',
        marginBottom: '0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        height: '100%',
        width: '60%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        top: '0',
        padding: '8px',
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
    channelImage: {
        borderRadius: '50%',
        maxHeight: '90px',
        width: 'auto',
    }
})

const FeedCard = ({type, data, classes}) => {

    const [pageUrl, setPageUrl] = useState("#")
    const [title, setTitle] = useState("")
    const [infoFields, setInfoFields] = useState([])
    const [dbInfo, setDbInfo] = useState("")
    useEffect(() => {
        switch (type) {
            case 'channel': {
                setTitle(data.channelTitle)
                setInfoFields([`${data.description}`])
                break
            }
            case 'video': {
                setTitle(data.title)
                setInfoFields([`${data.channelTitle} | ${data.published}`, data.description])
                setPageUrl("../video/" + data.id)
                break
            }
            case 'blog': {
                setTitle(data.title)
                setInfoFields([`${data.created}`, `${data.excerpt}`])
                setPageUrl("../blog/" + data.permalink)
            }
            default: break
        }
        if (Object.keys(data).includes("n_analyzed")) {
            setDbInfo(<Typography color='secondary'>{data.n_analyzed} comments analyzed</Typography>)
        }
    }, [])
    // Compile data fields into flexbox

    // Get info from database

    return (
        <Link to={pageUrl} className={classes.link}>
            <Card className={classes.root}>
                <div className={classes.cover}>
                    {data.thumbnail
                        ? <CardMedia
                            className={type === 'channel' ? classes.channelImage : ""}
                            component='img'
                            src={data.thumbnail}
                            title={title}
                        />
                        : null
                    }
                </div>
                <div className={classes.details}>
                    <CardActionArea className={classes.actionArea}>
                        <Typography variant='body1'>{title}</Typography>
                        {infoFields.map(field => <Typography variant='caption'>{field}</Typography>)}
                        {dbInfo}
                    </CardActionArea>
                </div>
            </Card>
        </Link>
    )
}

export default withStyles(styles)(FeedCard)
