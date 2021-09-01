import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import * as Router from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check';

import Waitlist from './Waitlist'

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
        marginTop: theme.spacing(16),
        margin: theme.spacing(2),
        maxWidth: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
        },
    },
    textBlock: {
        width: '60%',
    },
    red: {
        color: theme.palette.csRed.main,
    },
    benefit: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '2px',
        fontSize: '1em',
        fontWeight: '200',
        [theme.breakpoints.up('sm')]: {
            fontSize: '1.2em',
            padding: '4px'
        },
    },
    checkGap: {
        width: '10px',
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
    link: {
        color: 'inherit',
        textDecoration: 'none',
    },
    ctaDesktop: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: theme.spacing(2)
        }
    },
    ctaMobile: {
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    ctaButton: {
        fontSize: '1em',
        width: '200px',
        height: '50px',
        margin: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            width: '160px',
            height: '40px',
            margin: '0',
        },
    },
    ctaRed: {
        backgroundColor: theme.palette.csRed.main,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.csRed.dark,
        },
    },
    ctaDark: {
        backgroundColor: theme.palette.secondary.dark,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    },
})

const Splash = ({classes}) => {

    const [showWaitlist, setShowWaitlist] = useState(false)

    const ctaButtons = (
        <>
            <Router.Link to={'/dashboard'} className={classes.link}>
                <Button
                    id="demo"
                    variant='contained'
                    className={`${classes.ctaButton} ${classes.ctaRed}`}
                    // onClick={() => {}}
                >DEMO</Button>
            </Router.Link>
            <Button
                id="freeTrial"
                variant='contained'
                className={`${classes.ctaButton} ${classes.ctaDark}`}
                onClick={() => setShowWaitlist(true)}
            >JOIN WAIT LIST</Button>
        </>
    )

    return(
        <div className={classes.root}>
            <Waitlist isOpen={showWaitlist} setIsOpen={setShowWaitlist} />
            <div className={classes.content}>
                <div className={classes.textBlock}>
                    <Typography variant='h1' style={{fontFamily: 'Roboto'}}>
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
                    <div className={classes.ctaDesktop}>
                        {ctaButtons}
                    </div>
                </div>
                <div className={classes.imageBlock}>
                    <img src={iPhoneFrame} className={classes.iPhoneFrame}></img>
                    <img src={demoGif} className={classes.demoGif}></img>
                </div>
            </div>
            <div className={classes.ctaMobile}>
                {ctaButtons}
            </div>
        </div>
    )
}

export default withStyles(styles)(Splash)

