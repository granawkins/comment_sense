import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, useHistory } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'
import { useAuth0 } from '@auth0/auth0-react'

import getTheme from './theme.js'
import Landing from "./components/landing/Landing.jsx"
import Dashboard from "./components/dashboard/Dashboard.jsx"
import Admin from "./components/admin/Admin.jsx"
import Placeholder from "./components/Placeholder.jsx"
import Login from './components/Login.jsx';
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

  // AUTH0 GOOGLE USER STRUCTURE:
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

const App = ({classes}) => {

  let { user } = useAuth0()
  const [auth0User, setAuth0User] = useState(null)
  useEffect(() => {
      if (user) {
        setAuth0User(user)
      }
  }, [user])

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root} style={{backgroundColor: theme.palette.primary.main}}>
        <Router>
          <Switch>
            <Route path='/dashboard/:tab'>
              <Dashboard auth0User={auth0User} />
            </Route>
            <Route path='/dashboard'>
              <Redirect to='/dashboard/videos' />
            </Route>

            <Route path='/admin/:tab'>
              <Admin auth0User={auth0User} />
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

export default withStyles(styles)(App)
