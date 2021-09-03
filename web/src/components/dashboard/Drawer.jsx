import { useState, useEffect } from 'react'
import { Link, useParams, Switch, Route } from 'react-router-dom';
// import { useAuth0 } from '@auth0/auth0-react';

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
    initialCircle: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: 'darkGray',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'canter',
    },
    initial: {
        fontSize: '30pt',
        width: '100%',
        textAlign: 'center',
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

const ReactiveDrawer = ({section, drawerItems, activePage, mobileOpen,
                         handleDrawerToggle, channel, classes}) => {

    const [channelCard, setChannelCard] = useState(null)
    useEffect(() => {
        if (!channel) {
            return
        } else if (channel.thumbnail) {
            setChannelCard(
                <CardMedia
                    className={classes.avatar}
                    component='img'
                    src={channel.thumbnail}
                    title={channel.channel_title + 'Avatar'}
                />
            )
        } else {
            setChannelCard(
                <div className={classes.initialCircle}>
                    <Typography className={classes.initial}>
                        {channel.channel_title.charAt(0)}
                    </Typography>
                </div>
            )
        }
    }, [channel])

    useEffect(() => {
        handleDrawerToggle('closed')
    }, [activePage])

    // const { logout } = useAuth0()

    const drawer = (
        <div className={classes.drawer}>
            <Link to={`../../dashboard`} className={classes.link}>
                <div className={classes.logoBox}>
                    <Typography className={classes.logoText}>Comment</Typography>
                    <Typography className={`${classes.logoText} ${classes.csRed}`}>Sense</Typography>
                </div>
            </Link>
            <div className={classes.channelBox}>
                {channelCard}
                <Typography classes={{root: classes.h6}}>{channel.channel_title}</Typography>
            </div>
            <List>
                {drawerItems.map((text, index) => (
                    <Link to={`/${section}/${text}`} className={classes.link} key={text}>
                        <ListItem button key={text} selected={text === activePage}>
                            <Typography classes={{root: classes.h6}}>
                                {capitalize(text)}
                            </Typography>
                        </ListItem>
                    </Link>
                ))}
                <Link to={'/'} className={classes.link} key={'logout'}>
                    <ListItem button key={'logout'}>
                        <Typography classes={{root: classes.h6}}>
                            Logout
                        </Typography>
                    </ListItem>
                </Link>
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

