import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'
import Navbar from './components/Navbar.jsx'
import Feed from "./components/Feed.jsx"
import { Video } from "./components/Video.jsx"
import Landing from "./components/Landing.jsx"
import Admin from "./components/Admin.jsx"
import BlogFeed from "./components/BlogFeed.jsx"
import BlogDisplay from "./components/Blog/BlogDisplay.jsx"
import Contact from "./components/Contact.jsx"
import Placeholder from "./components/Placeholder.jsx"
import Footer from "./components/Footer.jsx"
import Dashboard from "./components/Dashboard.jsx"
import './App.css';

const csRed = '#B70000'
const lightWeight = '200'
const boldWeight = '400'

const theme = createTheme({
  typography: {
    fontFamily: ['Roboto'],
    h1: {
      fontSize: '30pt',
      fontWeight: '800',
      lineHeight: '1',
      // [theme.breakpoints.up('sm')]: {
      //   fontSize: '60px',
      // },
    },
    h3: {
      fontSize: '28pt',
      fontWeight: boldWeight,
    },
    h4: {
      fontSize: '28pt',
      fontWeight: lightWeight,
      color: csRed,
    },
    h5: {
      fontSize: '18',
      fontWeight: boldWeight,
    },
    h6: {
      fontSize: '18',
      fontWeight: lightWeight,
    },
    body1: {
      fontSize: '14',
      fontWeight: lightWeight,
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
    csRed: {
      main: csRed,
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

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: '#f5f5f5',
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
    <div className={classes.root}>
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path='/' exact component={() => <Landing />} />
            <Route path='/dashboard' exact component={() => <Dashboard />} />
            <Route path='/:page' exact component={() => <Placeholder pageName="placeholder" />} />
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
          </Switch>
        </Router>
      </ThemeProvider>
    </div>
  )
}

export default withStyles(styles)(App);
