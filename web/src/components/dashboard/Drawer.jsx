import { useState, useEffect } from 'react'
import { Link, useParams, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import CardMedia from '@material-ui/core/CardMedia'

import Footer from '../landing/Footer'
import { capitalize } from '../utils/helpers'

const drawerWidth = '240px'

const styles = (theme) => ({
    ...theme.typography,
    drawer: {
        position: 'relative',
        height: '100%',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    logoBox: {
        display: 'flex',
        flexDirection: 'row',
        padding: theme.spacing(2),
    },
    logoText: {
        fontSize: '24px',
        fontWeight: '400',
    },
    channelBox: {
        padding: theme.spacing(2),
    },
    avatar: {
        borderRadius: '50%',
        width: '100px',
    },
    csRed: {
        color: theme.palette.csRed.main,
    },
    link: {
        color: 'inherit',
        textDecoration: 'none',
    },
    footer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
    }
})

const ReactiveDrawer = ({drawerItems, activePage, mobileOpen, handleDrawerToggle, channel, classes}) => {

    useEffect(() => {
        handleDrawerToggle('closed')
    }, [activePage])

    useEffect(() => {
        // console.log(channel)
    }, [])

    const drawer = (
        <div className={classes.drawer}>
            <Link to={`../../dashboard`} className={classes.link}>
                <div className={classes.logoBox}>
                    <Typography className={classes.logoText}>Comment</Typography>
                    <Typography className={`${classes.logoText} ${classes.csRed}`}>Sense</Typography>
                </div>
            </Link>
            {channel
                ? <div className={classes.channelBox}>
                        <CardMedia
                        className={classes.avatar}
                        component='img'
                        src={channel.thumbnail}
                        title={channel.channel_title + 'Avatar'}
                    />
                    <Typography classes={{root: classes.h6}}>{channel.channel_title}</Typography>
                </div>
                : null
            }
            <List>
                {drawerItems.map((text, index) => (
                    <Link to={`/dashboard/${text}`} className={classes.link} key={text}>
                        <ListItem button key={text} selected={text === activePage}>
                            <Typography classes={{root: classes.h6}}>
                                {capitalize(text)}
                            </Typography>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Footer align='col' />
        </div>
    )

    return(
        <nav className={classes.drawer} aria-label="mailbox folders">
            <Hidden mdUp implementation="css">
                <Drawer
                    variant="temporary"
                    anchor={'left'}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    classes={{paper: classes.drawerPaper}}
                    ModalProps={{keepMounted: true}}
                >
                    {drawer}
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
                <Drawer
                    classes={{paper: classes.drawerPaper}}
                    variant="permanent"
                    open
                >
                    {drawer}
                </Drawer>
            </Hidden>
        </nav>
    )
}

export default withStyles(styles)(ReactiveDrawer)

