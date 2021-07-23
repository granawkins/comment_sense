import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'

const styles = (theme) => ({
    root: {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    paper: {
        marginTop: '20px',
        width: '100%',
        padding: '2%',
        boxSizing: 'border-box',
        [theme.breakpoints.up('sm')]: {
            width: '480px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    },
    checkboxes: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    checkbox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
})

const Logs = ({classes}) => {

    const APIs = ['recent', 'top', 'search', 'video', 'topics', 'comments',
                  'youtube_comments', 'analyze', 'cluster', 'blog']

    const [logs, setLogs] = useState([])
    const [active, setActive] = useState(null)
    useEffect(() => {
        let allActive = {}
        APIs.forEach(api => allActive[api] = true)
        setActive(allActive)

        const getLogs = async() => {
            // Get logs
            const url = '/api/get_logs'
            const params = APIs
            const results = await postData(url, params)
            const newLogs = []
            results.logs.forEach(item => {
                let fields = item.split(" - ")
                if (fields.length === 5) {
                    newLogs.unshift({time: fields[0].slice(5, 19), api: fields[3], details: fields[4]})
                }
            })
            setLogs(newLogs)
            calculateGoogleQuota(newLogs)
        }
        getLogs()
    }, [])

    const [feed, setFeed] = useState([])
    const updateFeed = () => {
        if (!logs) {
            return
        }
        let newFeed = []
        logs.forEach(log => {
            if (active[log.api]) {
                newFeed.push(log)
            }
        })
        console.log(logs[0])
        setFeed(newFeed)
    }

    useEffect(() => {
        updateFeed()
    }, [logs, active])

    const handleCheck = (e) => {
        setActive({ ...active, [e.target.name]: e.target.checked})
    }

    const [googleQuota, setGoogleQuota] = useState(0)
    const calculateGoogleQuota = (logs) => {
        const prices = {
            'search': 100,
            'video': 10,
            'youtube_comments': 100
        }
        let totalPrice = 0
        logs.forEach(log => {
            if (prices[log.api]) {
                totalPrice += prices[log.api]
            }
        })
        setGoogleQuota(totalPrice)
    }

    return(
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant='h6'>Overview</Typography>
                <Typography>Total logs: {logs.length}</Typography>
                <Typography>Google Quota: {googleQuota}</Typography>
            </Paper>
            <hr style={{margin: '10px 0'}} />
            <Paper className={classes.paper}>
                <FormGroup row className={classes.checkboxes}>
                    {active ? APIs.map(api => {
                        return(
                            <FormControlLabel className={classes.checkbox}
                                control={<Checkbox checked={active[api]} onChange={handleCheck} name={api} key={api}/>}
                                label={api}
                            />
                        )
                    }) : null}
                </FormGroup>
            </Paper>
            <hr style={{margin: '10px 0'}} />
            <TableContainer>
                <Table size='small' className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Api</TableCell>
                            <TableCell>Detail</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {feed.map(item => {
                            return (<TableRow key={Math.random()}>
                                <TableCell align="left">{item.time}</TableCell>
                                <TableCell align="left">{item.api}</TableCell>
                                <TableCell align="left">{item.details}</TableCell>
                            </TableRow>)
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default withStyles(styles)(Logs)
