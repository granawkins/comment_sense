import { useState, useEffect } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';
import Comment from './Comment'

const CommentsBlock = ({topicComments}) => {
    // let commentsList = topicComments.map(c => c[0])
    // let parsedComments = [...new Set(commentsList)]

    const [comments, setComments] = useState(null)
    useEffect(() => {
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch 
        const postData = async (url, data) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            console.log(response)
            return response.json()
        }
        
        postData('/api/comments', {comments: topicComments})
            .then(data => {
                setComments(data.comments)
            })
    }, [])
    
    if (!comments) {
        return( <CircularProgress color='secondary'/> )
    } else {
        return( comments.map(c => <Comment comment={c} />) )
    }
}

export default CommentsBlock
