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
        fontSize: '1.1em',
    },
    link: {
        color: 'gray',
        width: '100px',
        textAlign: 'center',
        textDecorationLine: 'underline',
        fontWeight: '200',
    },
    copyright: {
        color: 'gray',
        fontWeight: '200',
        fontSize: '0.9em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    }
})

const Footer = ({classes}) => {
    return(
        <div className={classes.root}>
            <Typography className={classes.links}>
                <Router.Link  to={"/blog"} className={classes.link}>
                    Blog
                </Router.Link>
                <Router.Link  to={"/contact"} className={classes.link}>
                    Contact
                </Router.Link>
                <Router.Link  to={"/privacy"} className={classes.link}>
                    Privacy
                </Router.Link>
                <Router.Link  to={"/terms"} className={classes.link}>
                    Terms
                </Router.Link>
            </Typography>
            <Typography className={classes.copyright}>
                <span>Built by <a href="http://twitter.com/granawkins" className={classes.link}>@granawkins</a></span>
                &copy;2021 Comment Sense
            </Typography>
        </div>
    )
}

export default withStyles(styles)(Footer)
