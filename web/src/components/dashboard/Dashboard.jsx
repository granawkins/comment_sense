import { useState, useEffect } from 'react'
import { useParams, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import ReactiveDrawer from './ReactiveDrawer'
import Feed from './feed/Feed'
import Videos from './pages/Videos'
import { postData, capitalize } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle';
import ErrorPage from '../../utils/ErrorPage';

const drawerWidth = '240px'

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
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            marginRight: 0,
            display: 'none',
        },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        [theme.breakpoints.up('md')]: {
            width: `calc(vw - 240px)`,
            marginLeft: drawerWidth,
        },
    },
})

const Dashboard = ({classes}) => {

    const user = {channelId: 'UCtinbF-Q-fVthA0qrFQTgXQ'}
    const params = useParams()
    const activePage = params.tab

    const [dashboardLoading, setDashboardLoading] = useState({})
    const [hasError, setHasError] = useState(false)
    const [channel, setChannel] = useState(null)
    useEffect(() => {
        setDashboardLoading(true)
        // Get channel data from youtube
        const getChannel = async () => {
            try {
                const response = await postData('/api/channel', {channelId: user.channelId})
                if (!response.channel) {
                    setDashboardLoading(false)
                    setHasError(true)
                } else {
                    setChannel(response.channel)
                    setDashboardLoading(false)
                }
            }
            catch {
                setDashboardLoading(false)
                setHasError(true)
            }
        }
        getChannel()
    }, [])

    const [placeholder, setPlaceholder] = useState("")
    useEffect(() => {
        if (dashboardLoading) {
            setPlaceholder(<LoadingCircle />)
        } else if (hasError) {
            setPlaceholder(<ErrorPage />)
        } else {
            setPlaceholder("")
        }
    }, [dashboardLoading, hasError])

    const drawerItems = ['videos', 'topics', 'settings', 'logout']
    const [mobileOpen, setMobileOpen] = useState(false)
    const handleDrawerToggle = (target=null) => {
        switch (target) {
            case 'open':
                setMobileOpen(true)
                break
            case 'closed':
                setMobileOpen(false)
                break
            default:
                setMobileOpen(!mobileOpen)
        }
    }

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

            {/* Navigation menu on the left. Fixed xl lg, Hidden md sm xs. */}
            <ReactiveDrawer drawerItems={drawerItems} activePage={activePage} channel={channel}
                            mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
            {/* offset content by drawerWidth when fixed */}
            <div className={classes.toolbar} />

            <div className={classes.content}>
                {dashboardLoading || hasError
                    ? placeholder
                    : <Switch>
                        <Route exact path={`/dashboard/videos`}>
                            <Videos user={user} channel={channel} key='videos'/>
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
                }
            </div>
        </div>
    )
}

export default withStyles(styles)(Dashboard)
