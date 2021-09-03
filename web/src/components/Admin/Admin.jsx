import { useState, useEffect } from 'react';

import { Link, useRouteMatch, useParams, Switch, Route } from 'react-router-dom';

import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import { withStyles } from '@material-ui/core/styles'

import BlogAdmin from '../blog/BlogAdmin'
import Feedback from './Feedback'
import Logs from './Logs'
import Login from '../Login'
import ReactiveDrawer from '../dashboard/Drawer'
import { capitalize } from '../utils/helpers';

const drawerWidth = '240px'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: 0,
        [theme.breakpoints.up('md')]: {
            alignItems: 'flex-start',
        },
    },
    content: {
        width: '100%',
        padding: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            width: '80%',
        },
        [theme.breakpoints.up('md')]: {
            width: `calc(100% - 240px)`,
            maxWidth: '800px',
            marginLeft: drawerWidth,
        },
        boxSizing: 'border-box',
    },
    titleLine: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 'inherit',
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            marginRight: 0,
            display: 'none',
        },
    },
})

const ADMIN_CHANNEL = {
    thumbnail: null,
    channel_title: 'Admin',
}

const Admin = ({userData, classes}) => {

    const params = useParams()
    const activePage = params.tab

    const drawerItems = ['users', 'logs', 'blog', 'contact', 'waitlist']
    const [mobileOpen, setMobileOpen] = useState(false)
    const handleDrawerToggle = (val=null) => {
        if (val === 'open') {
            setMobileOpen(true)
        } else if (val === 'closed') {
            setMobileOpen(false)
        } else {
            setMobileOpen(!mobileOpen)
        }
    }

    // Redirect if userData is incorrect
    if (!userData) {
        return <Login page="admin" />
    }
    if (userData.username !== "admin") {
        return <Login page="admin" />
    }

    return(
        <div className={classes.root}>

            {/* Navigation menu on the left. Fixed xl lg, Hidden md sm xs. */}
            <ReactiveDrawer
                section={'admin'}
                drawerItems={drawerItems}
                activePage={activePage}
                channel={ADMIN_CHANNEL}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />

            {/* Page title */}
            <main className={classes.content}>
                <div className={classes.titleLine}>
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
                </div>

                <Switch>
                    <Route exact path='/admin'>
                        <Typography>Please select a section.</Typography>
                    </Route>
                    <Route exact path={`/admin/users`}>
                        {/* <UsersAdmin /> */}
                    </Route>
                    <Route exact path={`/admin/logs`}>
                        <Logs />
                    </Route>
                    <Route exact path={`/admin/blog`}>
                        <BlogAdmin />
                    </Route>
                    <Route exact path={`/admin/contact`}>
                        <Feedback />
                    </Route>
                    <Route exact path={`/admin/waitlist`}>
                        {/* <WaitlistAdmin /> */}
                    </Route>
                </Switch>
            </main>
        </div>
    )
}

export default withStyles(styles)(Admin)
