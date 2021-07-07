import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Feed from "./components/Feed.jsx"
import Video from "./components/Video.jsx"
import './App.css';

// SocketIO Host
import io from 'socket.io-client'
const HOST_NAME = "http://0.0.0.0:5050/"
export const socket = io(HOST_NAME, {transports: ['websocket'], timeout: 60000})

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
            <Route path='/' exact component={() => <Feed page="recent"  host={HOST_NAME}/>} />
            <Route path='/search/:key' exact component={() => <Feed page="search" host={HOST_NAME}/>} />
            <Route path='/video/:videoId' exact component={() => <Video  host={HOST_NAME}/>} />
          </Switch>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
