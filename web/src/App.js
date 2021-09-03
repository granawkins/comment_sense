import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, useHistory } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'

// import { useAuth0 } from '@auth0/auth0-react'

import getTheme from './theme.js'
import Landing from "./components/landing/Landing.jsx"
import Dashboard from "./components/dashboard/Dashboard.jsx"
import Admin from "./components/admin/Admin.jsx"
import Placeholder from "./components/Placeholder.jsx"
import Login from './components/Login.jsx';
import LoadingCircle from './components/utils/LoadingCircle.js';
import { postData } from './components/utils/helpers.js';

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

  const [usernames, setUsernames] = useState([])
  useEffect(() => {

  }, [])

  // GET USER - In future, replace with auth0
  // ref: https://stackoverflow.com/a/61178371
  const history = useHistory
  const [userData, setUserData] = useState(null)
  useEffect(() => {
    const item = localStorage.getItem('userData')
    if (item) {
      setUserData(JSON.parse(item))
    }
  }, [history])

  const dashboard = <Dashboard auth0User={null} />
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root} style={{backgroundColor: theme.palette.primary.main}}>
        <Router>
          <Switch>
            <Route path='/dashboard/:tab'>
              {dashboard}
            </Route>
            <Route path='/dashboard'>
              <Redirect to='/dashboard/videos' />
            </Route>

            <Route path='/admin/:tab'>
              <Admin userData={userData} />
            </Route>
            <Route path='/admin'>
              <Redirect to='/admin/users' />
            </Route>

            <Route path='/u/:username'>
              <Login />
            </Route>

            <Route path='/:page'>
              <Placeholder />
            </Route>

            <Route path='/'>
              <Landing />
            </Route>

          </Switch>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default withStyles(styles)(App);



  // let { user, isAuthenticated, isLoading } = useAuth0()
  // const [dashboard, setDashboard] = useState(null)
  // useEffect(() => {
  //     if (isLoading) {
  //       setDashboard(<LoadingCircle />)
  //     // } else if (!isAuthenticated) {
  //     //   console.log(`Unable to authenticate user`)
  //     //   setDashboard(<Redirect to='/' />)
  //     } else {
  //       setDashboard(<Dashboard auth0User={user} />)
  //     }
  // }, [isLoading, isAuthenticated])

  // // AUTH0 USER STRUCTURE:
  // const user = {
  //   email: "granthawkins88@gmail.com",
  //   email_verified: true,
  //   family_name: "Hawkins",
  //   given_name: "Grant",
  //   locale: "en",
  //   name: "Grant Hawkins",
  //   nickname: "granthawkins88",
  //   picture: "https://lh3.googleusercontent.com/a-/AOh14Ggx_la7EufYVuwYhxbtTs9j3OJDpW5N3Wo2YeBXPLA=s96-c",
  //   sub: "google-oauth2|102946505160688760338",
  //   updated_at: "2021-08-24T02:01:47.992",
  // }
