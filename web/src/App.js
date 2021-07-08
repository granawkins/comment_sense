import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Feed from "./components/Feed.jsx"
import Video from "./components/Video.jsx"
import './App.css';

function App() {

  let theme = createMuiTheme({
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
    <div className="App">
      <ThemeProvider theme={theme}>
        <Router>
          <Navbar />
          <Switch>
            <Route path='/' exact component={() => <Feed page="recent" />} />
            <Route path='/search/:key' exact component={() => <Feed page="search" />} />
            <Route path='/video/:videoId' exact component={() => <Video  />} />
          </Switch>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
