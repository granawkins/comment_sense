import { useState, useEffect } from 'react'
import { Link, useParams, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import Footer from './landing/Footer'
import Feed from './dashboard/Feed'

const drawerWidth = '240px'

const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

const styles = (theme) => ({
    ...theme.typography,
    root: {
        // display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
    appBar: {
        [theme.breakpoints.up('md')]: {
            width: `calc(100% - 240px)`,
            marginLeft: drawerWidth,
        },
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
    csRed: {
        color: theme.palette.csRed.main,
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            marginRight: 0,
            display: 'none',
        },
      },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawer: {
        position: 'relative',
        height: '100%',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    link: {
        color: 'inherit',
        textDecoration: 'none',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        [theme.breakpoints.up('md')]: {
            width: `calc(vw - 240px)`,
            marginLeft: drawerWidth,
        },
    },
    footer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
    }
})

const Dashboard = ({classes}) => {

    const user = {
        channelId: 'UCtinbF-Q-fVthA0qrFQTgXQ'
    }

    const [mobileOpen, setMobileOpen] = useState(false)
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const params = useParams()
    const activePage = params.tab
    useEffect(() => {
        setMobileOpen(false)
    }, [activePage])

    const drawerItems = ['videos', 'topics', 'settings', 'logout']
    const drawer = (
        <div className={classes.drawer}>
            <Link to={`../dashboard`} className={classes.link}>
                <div className={classes.logoBox}>
                    <Typography className={classes.logoText}>Comment</Typography>
                    <Typography className={`${classes.logoText} ${classes.csRed}`}>Sense</Typography>
                </div>
            </Link>
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
            {/* <div className={classes.footer}>

            </div> */}
        </div>
    )

    return(
        <div className={classes.root}>
            <AppBar position="fixed" className={classes.appBar} elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h3" noWrap>
                        {capitalize(activePage)}
                    </Typography>
                </Toolbar>
            </AppBar>
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
            <div className={classes.toolbar} />
            <div className={classes.content}>
                <Switch>
                    <Route exact path={`/dashboard/videos`}>
                        <Feed user={user} type='videos' key='videos'/>
                    </Route>
                    <Route exact path={`/dashboard/topics`}>
                        <Feed user={user} type='topics' key='topics' />
                    </Route>
                    <Route exact path={`/dashboard/video/:videoId`}>
                        <Feed user={user} type='topics' key='video' />
                    </Route>
                    <Route exact path={`/dashboard/settings`}>
                        Settings
                    </Route>
                </Switch>
            </div>
        </div>
    )
}

export default withStyles(styles)(Dashboard)
