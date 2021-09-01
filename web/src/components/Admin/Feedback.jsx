import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { postData } from '../utils/helpers'
import LoadingCircle from '../utils/LoadingCircle'

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
    }
})

const Feedback = ({classes}) => {

    const [feedback, setFeedback] = useState([])
    useEffect(() => {
        const getFeedback = async () => {
            fetch('/api/get_feedback')
                .then(res => res.json())
                .then(data => {
                    console.log(data.feedback)
                    setFeedback(data.feedback)
                })
        }
        getFeedback()
    }, [])

    return(
        <div className={classes.root}>
            {feedback.map(f => {
                return (
                    <Paper className={classes.paper}>
                        <Typography>{f.created}</Typography>
                        <Typography>{f.email}</Typography>
                        <hr style={{margin: '10px 0'}}/>
                        <Typography>{f.message}</Typography>
                    </Paper>
                )
            })}
        </div>
    )
}

export default withStyles(styles)(Feedback)
