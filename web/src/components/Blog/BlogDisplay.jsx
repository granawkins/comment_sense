import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { useParams } from 'react-router'

import BlogPost from './BlogPost'
import { postData } from '../../utils/helpers'
import LoadingCircle from '../../utils/LoadingCircle'

const styles = (theme) => ({
    root: {

    },
})

const BlogDisplay = ({classes}) => {
    const permalink = useParams().permalink

    const [blog, setBlog] = useState(null)

    useEffect(() => {
        const getBlog = async() => {
            fetch('/api/get_blog_post/' + permalink)
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    setBlog(data.blog)
                })
            // const response = await postData('get_blog_post', { permalink })
            // console.log(response)
            // if (response.blog) {
            //     setBlog(response.blog)
            // }
        }
        getBlog()
    }, [])

    return(
        <div id="root">
            {blog
                ? <BlogPost blog={blog} />
                : <LoadingCircle />
            }

        </div>
    )
}

export default withStyles(styles)(BlogDisplay)
