import { withStyles } from '@material-ui/core/styles'
import * as Router from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check';
import iPhoneFrame from '../../assets/iphone-frame.png'
import demoGif from '../../assets/demo-gif.gif'

const styles = (theme) => ({
    root: {
        height: '100vh',
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    content: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'nowrap',
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
        lineHeight: '1',
        fontWeight: '800',
        [theme.breakpoints.up('sm')]: {
            fontSize: '60px',
        },
    },
    csRed: {
        backgroundColor: theme.palette.csRed.main,
        color: 'white',
    },
    benefit: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '2px',
        fontSize: '1em',
        fontWeight: '200',
        [theme.breakpoints.up('md')]: {
            fontSize: '1.2em',
            padding: '4px'
        },
    },
    checkGap: {
        width: '10px',
    },
    cta: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingTop: '20px',
    },
    ctaButton: {
        [theme.breakpoints.up('xs')]: {
            minWidth: '120px',
        },
    }
})

const Pricing = ({classes}) => {
    return(
        <div className={classes.root}>
        <div className={classes.content}>
            <div className={classes.textBlock}>
                <Typography className={classes.leadLine}>
                    Your{<br/>}YouTube{<br/>}comments,{<br/>}<span className={classes.red}>sorted.</span>
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
                <Typography className={classes.benefit} style={{fontWeight: '600'}}>
                    <CheckIcon style={{fontSize: '1.5em'}} />
                    <div className={classes.checkGap}></div>
                    Get the full story
                </Typography>
                <div className={classes.cta}>
                    <Router.Link to={'/dashboard'} className={classes.link}>
                        <Button
                            id="demo"
                            variant='contained'
                            className={classes.ctaButton, classes.csRed}
                            onClick={() => {}}
                        >DEMO</Button>
                    </Router.Link>
                    <Button
                        id="freeTrial"
                        variant='contained'
                        color='dark'
                        className={classes.ctaButton}
                        onClick={() => {}}
                    >FREE TRIAL</Button>
                </div>
            </div>
            <div className={classes.imageBlock}>
                <img src={iPhoneFrame} className={classes.iPhoneFrame}></img>
                <img src={demoGif} className={classes.demoGif}></img>
            </div>
        </div>
        </div>
    )
}

export default withStyles(styles)(Pricing)

