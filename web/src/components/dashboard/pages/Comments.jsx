import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Controller from './Controller'
import Feed from './feed/Feed'
import CommentCard from './feed/CommentCard'

import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'
import ErrorPage from '../../utils/ErrorPage'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
})

// Rendered only after dashboard has a valid channel object
const Comments = ({user, channel, videoId=null, commentIds=[], control={}, classes}) => {

    // Tells the Feed where to get items, and how to render them.
    const query = {
        api: '/api/comments',
        data: {user, pageSize: 10, commentIds},
    }
    const render = (comment) => {
        return <CommentCard comment={comment} key={comment.id} />
    }

    const [pageLoading, setPageLoading] = useState(null)
    const [hasError, setHasError] = useState(null)
    const [placeholder, setPlaceholder] = useState("")
    useEffect(() => {
        if (pageLoading) {
            setPlaceholder(<LoadingCircle />)
        } else if (hasError) {
            setPlaceholder(<ErrorPage />)
        } else {
            setPlaceholder("")
        }
    }, [pageLoading, hasError])

    return(
        <div className={classes.root}>
            {pageLoading || hasError
                ? placeholder
                : <Feed
                    query={query}
                    control={control}
                    render={render}
                />}
        </div>
    )
}

export default withStyles(styles)(Comments)
