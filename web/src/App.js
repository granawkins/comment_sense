import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'
import Navbar from './components/landing/Navbar.jsx'
import Feed from "./components/Feed.jsx"
import { Video } from "./components/Video.jsx"
import Landing from "./components/Landing.jsx"
import Admin from "./components/Admin.jsx"
import BlogFeed from "./components/BlogFeed.jsx"
import BlogDisplay from "./components/Blog/BlogDisplay.jsx"
import Contact from "./components/Contact.jsx"
import Placeholder from "./components/Placeholder.jsx"
import Footer from "./components/landing/Footer.jsx"
import Dashboard from "./components/Dashboard.jsx"
import './App.css';

const csRed = '#B70000'
const lightWeight = '200'
const boldWeight = '600'

const theme = createTheme({
  typography: {
    fontFamily: ['Roboto'],
    h1: {
      fontSize: '2.5em',
      fontWeight: '800',
      lineHeight: '1',
    },
    h3: {
      fontSize: '2em',
      fontWeight: boldWeight,
    },
    h4: {
      fontSize: '2em',
      fontWeight: lightWeight,
      color: csRed,
    },
    h5: {
      fontSize: '1.2em',
      fontWeight: boldWeight,
    },
    h6: {
      fontSize: '1.2em',
      fontWeight: lightWeight,
    },
    body1: {
      fontSize: '1em',
      fontWeight: lightWeight,
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': 'Roboto',
      },
    },
  },
  palette: {
    primary: {
      main: '#F5F5F5',
      dark: '#1E1E1E',
    },
    secondary: {
      main: '#FFFFFF',
      dark: '#252526',
    },
    error: {
      main: '#B70000',
      dark: '#FFFFFF',
    },
    csRed: {
      main: csRed,
      dark: '#8B0000',
    },
    faded: {
      main: '#7D7D7D',
    },
  },
  components: {
    MuiButton: {
      variants: [

      ]
    }
  }
})

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
