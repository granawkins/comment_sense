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
const Comments = ({user, channel, videoId=null, commentIds=[], classes}) => {

    const [control, setControl] = useState({})
    useEffect(() => {
        setControl({pageSize: 10, search: "", sort: 'top'})
    }, [])

    // Tells the Feed where to get items, and how to render them.
    const query = {
        api: '/api/comments',
        data: {user, commentIds},
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
                : <>
                    <Controller
                        type='comments'
                        control={control}
                        setControl={setControl}
                        sortOptions={['recent', 'oldest', 'top']}
                    />
                    <Feed
                        query={query}
                        control={control}
                        render={render}
                    />
                </>
            }
        </div>
    )
}

export default withStyles(styles)(Comments)
