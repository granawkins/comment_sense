import { useState, useEffect } from 'react'
import { useParams, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import ReactiveDrawer from './Drawer'
import Videos from './pages/Videos'
import Video from './pages/Video'
import Topics from './pages/Topics'
import { postData, capitalize } from '../utils/helpers'
import LoadingCircle from '../utils/LoadingCircle';
import ErrorPage from '../utils/ErrorPage';

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

const Dashboard = ({classes}) => {

    const user = {channelId: 'UCtinbF-Q-fVthA0qrFQTgXQ', sentimentEnabled: true}
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
                /*
                const response = {channel: {
                    created: "Fri, 06 Aug 2021 18:52:49 GMT"
                    db_comments: 633
                    db_videos: 50
                    id: "UCtinbF-Q-fVthA0qrFQTgXQ"
                    ignore_list: null
                    labels_list: null
                    last_refresh: "2021-08-07 20:28:37.211097"
                    last_scan: "2021-08-07 08:08:15.470295"
                    next_page_token: "CDIQAA"
                    subs_list: null
                    thumbnail: "https://..."
                    title: "CaseyNeistat"
                    topics: (361) [{…}, …]
                    labels: ['PERSON'...]
                    total_videos: null
                }}
                */
                if (!response.channel) {
                    setDashboardLoading(false)
                    setHasError(true)
                    if (response.error) {
                        console.log(`Error loading channel from Dashboard: ${response.error}`)
                    }
                } else {
                    setChannel(response.channel)
                    setDashboardLoading(false)
                }
            }
            catch(e) {
                setDashboardLoading(false)
                setHasError(true)
                console.log(`Error loading dashboard: ${e}`)
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


            {/* Navigation menu on the left. Fixed xl lg, Hidden md sm xs. */}
            <ReactiveDrawer drawerItems={drawerItems} activePage={activePage} channel={channel}
                            mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
            <div className={classes.content}>
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
                {dashboardLoading || hasError
                    ? placeholder
                    : <Switch>
                        <Route exact path={`/dashboard/videos`}>
                            <Videos user={user} channel={channel} key='videos'/>
                        </Route>
                        <Route exact path={`/dashboard/topics`}>
                            <Topics user={user} channel={channel} page='channel' key='topics' />
                        </Route>
                        <Route exact path={`/dashboard/video/:videoId`}>
                            <Video user={user} channel={channel} key='video' />
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
