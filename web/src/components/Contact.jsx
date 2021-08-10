import { useState, useEffect } from 'react'

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

import { postData } from './utils/helpers'

const styles = (theme) => ({
    root: {
        padding: '30px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paper: {
        width: '100%',
        padding: '5%',
        boxSizing: 'border-box',
        [theme.breakpoints.up('sm')]: {
            width: '480px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },

        "& div": {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }
    },
    inputEmail: {
        width: '200px',
        height: 'auto',
    },
    inputMessage: {
        width: '100%',
        height: '100%',
    }
})

const Contact = ({classes}) => {

    const [email, setEmail] = useState(null)
    const [message, setMessage] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        const results = await postData('/api/add_feedback', {email, message})
        console.log(results)
        setSubmitted(true)
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                {submitted
                    ? <div>
                        <Typography>Thanks for your message!</Typography>
                    </div>
                    : <div>
                        <TextField
                            label='Message'
                            multiline
                            row={5}
                            rowsMax={10}
                            className={classes.inputMessage}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <div style={{marginTop: '30px'}} />
                        <TextField
                            label='Email'
                            className={classes.inputEmail}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div style={{marginTop: '30px'}} />
                        <Button variant='contained' onClick={handleSubmit}>Submit</Button>
                    </div>
                }
            </Paper>
        </div>
    )
}

export default withStyles(styles)(Contact)
