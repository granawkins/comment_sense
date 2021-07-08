import { useState, useEffect } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';
import Comment from './Comment'

const CommentsBlock = ({topicComments}) => {
    // let commentsList = topicComments.map(c => c[0])
    // let parsedComments = [...new Set(commentsList)]

    const [comments, setComments] = useState(null)
    useEffect(() => {
        console.log('Get comments')
    }, [])
    
    if (!comments) {
        return( <CircularProgress color='secondary'/> )
    } else {
        return( comments.map(c => <Comment comment={c} />) )
    }
}

export default CommentsBlock
