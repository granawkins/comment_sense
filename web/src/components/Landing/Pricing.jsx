import { withStyles } from '@material-ui/core/styles'
import * as Router from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check';
import iPhoneFrame from '../../assets/iphone-frame.png'
import demoGif from '../../assets/demo-gif.gif'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        height: '100vh',
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '-50px',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
        },
    },
    options: {
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '30px',
        [theme.breakpoints.up('sm')]: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
    },
    option: {
        height: '250px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: theme.spacing(1),
        padding: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            height: '300px',
            margin: theme.spacing(2),
            padding: theme.spacing(4),
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

const Pricing = ({classes}) => {
    return(
        <div className={classes.root}>
            <div className={classes.content}>
                <Typography variant='h4'>
                    Pricing
                </Typography>
                <div className={classes.options}>
                    <Paper className={classes.option}>
                        <Typography className={classes.h5}>
                            Pay as you go
                        </Typography>
                        <Typography className={classes.body1}>
                            <li>Livestream & Catalog</li>
                            <li>Browse by video or topic</li>
                            <li>User-defined libraries</li>
                            <li>Comment Quota</li>
                        </Typography>
                        <Typography className={classes.h6}>
                            $5 / 10,000 comments
                        </Typography>
                        <Button variant='contained' className={`${classes.ctaButton} ${classes.ctaDark}`}>
                            BUY NOW
                        </Button>
                    </Paper>
                    <Paper className={classes.option}>
                        <Typography className={classes.h5}>
                            Subscribe
                        </Typography>
                        <Typography  className={classes.body1}>
                            <li>Livestream & Catalog</li>
                            <li>Browse by video or topic</li>
                            <li>User-defined libraries</li>
                            <li style={{fontWeight: '600'}}>Unlimited comments</li>
                        </Typography>
                        <Typography  className={classes.h6}>
                            $20/month
                        </Typography>
                        <Button variant='contained' className={`${classes.ctaButton} ${classes.ctaRed}`}>
                            SUBSCRIBE
                        </Button>
                    </Paper>
                </div>
            </div>
        </div>
    )
}

export default withStyles(styles)(Pricing)

