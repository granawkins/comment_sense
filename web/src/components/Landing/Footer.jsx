import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import * as Router from 'react-router-dom';

const styles = (theme) => ({
    root: {
        position: 'absolute',
        width: '100%',
        bottom: '0',
        left: '0',
        backgroundColor: theme.palette.secondary.main,
        margin: '0',
        zIndex: '100',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'nowrap',
        margin: theme.spacing(2)
    },
    linksRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    linksCol: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    link: {
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.secondary.dark
        }
    },
    copyright: {
        color: theme.palette.faded.main
    }
})

const Footer = ({align='row', classes}) => {
    return(
        <div className={classes.root}>
            <Box className={classes.container}>
                <div className={align === 'row' ? classes.linksRow : classes.linksCol}>
                    <Router.Link  to={"/blog"} className={classes.link}>
                        <Typography variant='body1'>Blog</Typography>
                    </Router.Link>
                    <Router.Link  to={"/contact"} className={classes.link}>
                        <Typography variant='body1'>Contact</Typography>
                    </Router.Link>
                    <Router.Link  to={"/privacy"} className={classes.link}>
                        <Typography variant='body1'>Privacy</Typography>
                    </Router.Link>
                    <Router.Link  to={"/terms"} className={classes.link}>
                        <Typography variant='body1'>Terms</Typography>
                    </Router.Link>
                </div>
                <br></br>
                <Typography variant='body1' className={classes.copyright}>&copy;2021 Comment Sense</Typography>
            </Box>
        </div>
    )
}

export default withStyles(styles)(Footer)
