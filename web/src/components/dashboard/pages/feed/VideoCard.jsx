import { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import { postData } from '../../../utils/helpers';

const styles = (theme) => ({
    root: {
        height: '100%',
        padding: '0',
        margin: '10px 0 0 0',
        boxSizing: 'border-box',
        width: '100%',
        // [theme.breakpoints.up('sm')]: {
        //     width: '480px',
        // },
        // [theme.breakpoints.up('md')]: {
        //     width: '700px',
        // },
    },
    link: {
        width: '100%',
        height: '100%',
        color: 'inherit',
        textDecoration: 'none',
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        // display: 'flex',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridAutoRows: '1fr',
    },
    cover: {
        gridColumn: '1',
        height: 'auto',
        marginBottom: '0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        height: '100%',
        gridColumn: '2 / span 2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px 16px',
        boxSizing: 'border-box',
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
        margin: '5%',
        width: 'auto',
    }
})

const VideoCard = ({type, data, inactive, classes}) => {

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
                setPageUrl("../dashboard/video/" + data.id)
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
            setDbInfo(<Typography variant='body1' color='secondary'>{data.n_analyzed} comments analyzed</Typography>)
        }
    }, [])
    // Compile data fields into flexbox

    // Get info from database

    return (
        <Card className={classes.root}>
            <CardActionArea className={classes.actionArea}>
                <Link to={inactive ? '#' : pageUrl} className={classes.link}>
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
                        <Typography variant='body1' style={{fontWeight: '400', fontSize: '1.2em'}}>{title}</Typography>
                        {infoFields.map(field => <Typography variant='caption' key={field}>{field}</Typography>)}
                        {dbInfo}
                    </div>
                </Link>
            </CardActionArea>
        </Card>
    )
}

export default withStyles(styles)(VideoCard)
