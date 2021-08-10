import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'

import getTheme from './theme.js'
import Landing from "./components/landing/Landing.jsx"
import Dashboard from "./components/dashboard/Dashboard.jsx"
import Contact from "./components/Contact.jsx"
import Placeholder from "./components/Placeholder.jsx"

const theme = getTheme()

theme.typography.h1 = {
  [theme.breakpoints.up('sm')]: {
    fontSize: '3.5em',
  },
}

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
  },
  body: {
    flexGrow: 1,
  },
  navBar: {
    zIndex: 100
  },
  footer: {
    zIndex: 100
  },
})

const App = ({classes}) => {
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root} style={{backgroundColor: theme.palette.primary.main}}>
        <Router>
          <Switch>
            <Route path='/' exact component={() => <Landing />} />
            <Route exact path='/dashboard'>
              <Redirect to='/dashboard/videos' />
            </Route>
            <Route path='/dashboard/:tab' exact component={() => <Dashboard />} />
            <Route path='/dashboard/:tab/:videoId' exact component={() => <Dashboard />} />
            {/* <Route path='/recent' exact component={() => <Feed pageName="recent" />} />
            <Route path='/top' exact component={() => <Feed pageName="top" />} />
            <Route path='/search/:key' exact component={() => <Feed pageName="search" />} />
            <Route path='/video/:videoId' exact component={() => <Video  />} />
            <Route path='/admin' exact component={() => <Admin />} />
            <Route path='/admin/:tab' exact component={() => <Admin />} />
            <Route path='/blog' exact component={() => <BlogFeed />} />
            <Route path='/blog/:permalink' exact component={() => <BlogDisplay />} />
            <Route path='/contact' exact component={() => <Contact />} />
            <Route path='/privacy' exact component={() => <Placeholder pageName='Privacy Policy' />} />
          <Route path='/terms' exact component={() => <Placeholder pageName='Terms of Service' />} /> */}
          <Route path='/:page' exact component={() => <Placeholder />} />
          </Switch>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default withStyles(styles)(App);
