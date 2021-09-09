import { useState, useEffect } from 'react';

import { Link, useRouteMatch, useParams, Switch, Route } from 'react-router-dom';

import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import { withStyles } from '@material-ui/core/styles'

import UsersAdmin from './pages/UsersAdmin';
import BlogAdmin from '../blog/BlogAdmin'
import Feedback from './Feedback'
import Logs from './Logs'
import ReactiveDrawer from '../dashboard/Drawer'
import LoadingCircle from '../utils/LoadingCircle';
import ErrorPage from '../utils/ErrorPage';
import { postData, capitalize } from '../utils/helpers';

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

const Admin = ({auth0User, classes}) => {

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

    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [invalid, setInvalid] = useState(false)
    const [userData, setUserData] = useState(null)
    const getUser = async () => {
        try {
            const response = await postData('/api/user', {auth0User})
            if (!response.user) {
                setIsLoading(false)
                setHasError(true)
                if (response.error) {
                    console.log(`Error loading user from database: ${response.error}`)
                }
            } else {
                setUserData(response.user)
                validateUser(response.user)
            }
        }
        catch(e) {
            setIsLoading(false)
            setHasError(true)
            console.log(`Error loading dashboard: ${e}`)
        }
    }
    const validateUser = (user) => {
        const ADMIN_USERS = ['google-oauth2|102946505160688760338']
        if (ADMIN_USERS.includes(user.id)) {
            setInvalid(true)
            setIsLoading(false)
        } else {
            // TODO: Redirect
            setIsLoading(false)
            setInvalid(true)
        }
    }

    const routes = (
        <Switch>
            <Route exact path='/admin'>
                <Typography>Please select a section.</Typography>
            </Route>
            <Route exact path={`/admin/users`}>
                <UsersAdmin userData={userData} />
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
    )

    const [placeholder, setPlaceholder] = useState([])
    useEffect(() => {
        if (isLoading) {
            setPlaceholder(<LoadingCircle />)
        } else if (hasError) {
            setPlaceholder(<ErrorPage />)
        } else if (invalid) {
            setPlaceholder(<Typography>Active user is not Admin</Typography>)
        }
    }, [isLoading, hasError, invalid])

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

            </main>

            {isLoading || hasError || invalid
                ? {placeholder}
                : {routes}
            }
        </div>
    )
}

export default withStyles(styles)(Admin)
