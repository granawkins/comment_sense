import { useState, useEffect } from 'react'
import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle';
import Comment from './Comment'

const CommentsBlock = ({topicComments}) => {

    const [comments, setComments] = useState(null)

    useEffect(() => {
        postData('/api/comments', {comments: topicComments})
            .then(data => {
                setComments(data.comments)
            })
    }, [topicComments])
    
    if (!comments) {
        return ( <LoadingCircle /> )
    } else {
        return( comments.map(c => <Comment comment={c} key={c.id} />) )
    }
}

export default CommentsBlock
