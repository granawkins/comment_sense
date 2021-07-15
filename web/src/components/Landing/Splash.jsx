import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CheckIcon from '@material-ui/icons/Check';
import iPhoneFrame from '../../assets/iphone-frame.png'
import demoGif from '../../assets/demo-gif.gif'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        marginTop: '60px',
        margin: '10px',
        maxWidth: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
        },
    },
    imageBlock: {
        position: 'relative',
        paddingRight: '10px',
        width: '40%',
    },
    iPhoneFrame: {
        position: 'relative',
        zIndex: 20,
        position: 'relative',
        top: 0,
        left: 0,
        padding: '10px',
        width: '100%',
    },
    demoGif: {
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '15%',
        width: '78%',
        [theme.breakpoints.up('sm')]: {
            padding: '10%',
            width: '84%',
        },
    },
    textBlock: {
        width: '60%',
    },
    leadLine: {
        fontFamily: 'Roboto',
        fontSize: '40px', 
        lineHeight: '0.9',
        fontWeight: '800',
        [theme.breakpoints.up('sm')]: {
            fontSize: '60px',
        },
    },
    benefit: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '2px',
        fontSize: '1em',
        [theme.breakpoints.up('md')]: {
            fontSize: '1.2em',
            padding: '4px'
        },
    },
    checkGap: {
        width: '10px',
    },
})

const Splash = ({classes}) => {
    return(
        <div className={classes.root}>
            <div className={classes.textBlock}>
                <Typography className={classes.leadLine}>
                    Better{<br/>}YouTube{<br/>}comments.
                </Typography>
                {<br/>}
                <Typography className={classes.benefit}>
                    <CheckIcon style={{fontSize: '1.5em'}} />
                    <div className={classes.checkGap}></div>
                    Scan hundreds of comments in seconds
                </Typography>
                <Typography className={classes.benefit}>
                    <CheckIcon style={{fontSize: '1.5em'}} />
                    <div className={classes.checkGap}></div>
                    Cluster by topic
                </Typography>
                <Typography className={classes.benefit}>
                    <CheckIcon style={{fontSize: '1.5em'}} />
                    <div className={classes.checkGap}></div>
                    AI-powered sentiment analysis
                </Typography>
                <Typography className={classes.benefit} style={{fontWeight: '600', color: 'green'}}>
                    <CheckIcon style={{fontSize: '1.5em'}} />
                    <div className={classes.checkGap}></div>
                    Get the full story
                </Typography>
            </div>
            <div className={classes.imageBlock}>
                <img src={iPhoneFrame} className={classes.iPhoneFrame}></img>
                <img src={demoGif} className={classes.demoGif}></img>
            </div>
        </div>
    )
}

export default withStyles(styles)(Splash)

