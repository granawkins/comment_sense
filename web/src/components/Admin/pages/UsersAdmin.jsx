import { useState, useEffect } from "react"
import { withStyles } from '@material-ui/core/styles'
import { postData } from "../../utils/helpers"

const styles = (theme) => ({
    ...theme.typography,
    root: {
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0',
    },
    error: {
        color: theme.palette.csRed.main,
    },
    csRed: {
        color: 'white',
        backgroundColor: theme.palette.csRed.main,
    }
})

const UsersAdmin = ({userData, classes}) => {

    // Fetch the list of users
    const [users, setUsers] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    useEffect(() => {
        const getUsers = async () => {
            const token = null
            const results = await postData('/api/get_users', {token})
            /*
            const users = [{
                id:
                username:
                password:
                email:
                email_verified:
                quota:
                sentiment_on:
                channel_id:
            }]
            */
            if (!results.users) {
                setHasError(true)
                setIsLoading(false)
            }
            setUsers(results.users)
            setIsLoading(false)
        }
        getUsers()
    }, [])

    useEffect(() => {
        console.log(users)
    }, [users])

    // Display relevant info in a table

    // User editor overlay

    // Add / Edit user button

    // Reset password workflow

    return (<></>)
}

export default withStyles(styles)(UsersAdmin)
