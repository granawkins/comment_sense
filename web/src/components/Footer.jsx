import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import * as Router from 'react-router-dom';

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: 'black',
        margin: '0',
        width: '100%',
        minHeight: '100px',
        padding: '10px 0',
        color: 'gray',
    },
    links: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '600px',
            flexDirection: 'row',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    },
    link: {
        color: 'gray',
        width: '100px',
        textAlign: 'center',
        textDecorationLine: 'underline',
    }
})

const Footer = ({classes}) => {

    return(
        <div className={classes.root}>
            <div className={classes.links}>
                <Router.Link  to={"/blog"} className={classes.link}>
                    <Typography>Blog</Typography>
                </Router.Link>
                <Router.Link  to={"/contact"} className={classes.link}>
                    <Typography>Contact</Typography>
                </Router.Link>
                <Router.Link  to={"/privacy"} className={classes.link}>
                    <Typography>Privacy</Typography>
                </Router.Link>
                <Router.Link  to={"/terms"} className={classes.link}>
                    <Typography>Terms</Typography>
                </Router.Link>
            </div>
            <Typography variant='body1'>
                &copy; 2021 Comment Sense
            </Typography>
        </div>
    )
}

export default withStyles(styles)(Footer)
