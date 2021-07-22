import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'
import Navbar from './components/Navbar.jsx'
import Feed from "./components/Feed.jsx"
import { Video } from "./components/Video.jsx"
import Landing from "./components/Landing.jsx"
import Admin from "./components/Admin.jsx"
import Placeholder from "./components/Placeholder.jsx"
import Footer from "./components/Footer.jsx"
import './App.css';

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    margin: 0,
    padding: 0
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

  let theme = createTheme({
    palette: {
      primary: {
        main: '#fafafa',
      },
      secondary: {
        main: '#b71c1c',
      },
      dark: {
        main: '#424242',
      },
      info: {
        light: '#bdbdbd',
        main: '#bdbdbd',
        dark: '#bdbdbd',
        contrastText: '#bdbdbd',
      }
    }
  })

  return (
    <div className={classes.root}>
      <ThemeProvider theme={theme}>
        <Router>
          <Navbar className={classes.navBar} />
          <div className={classes.body}>
          <Switch>
            <Route path='/' exact component={() => <Landing />} />
            <Route path='/recent' exact component={() => <Feed pageName="recent" />} />
            <Route path='/search/:key' exact component={() => <Feed pageName="search" />} />
            <Route path='/video/:videoId' exact component={() => <Video  />} />
            <Route path='/admin' exact component={() => <Admin />} />
            <Route path='/admin/:tab' exact component={() => <Admin />} />
            <Route path='/blog' exact component={() => <Placeholder pageName='Blog' />} />
            <Route path='/contact' exact component={() => <Placeholder pageName='Contact' />} />
            <Route path='/privacy' exact component={() => <Placeholder pageName='Privacy Policy' />} />
            <Route path='/terms' exact component={() => <Placeholder pageName='Terms of Service' />} />
          </Switch>
          </div>
          <Footer className={classes.footer} />
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default withStyles(styles)(App);
