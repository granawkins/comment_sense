import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
    root: {

    },
    title: {
        fontSize: '1.5em',
        fontWeight: '400',
    }
})

const BlogPost = ({blog, classes}) => {

    const [content, setContent] = useState("Content")
    useEffect(() => {
        if (blog.content !== '') {
            setContent(blog.content)
        } else {
            setContent('<p>Content</p>')
        }
    }, [blog])

    return(
        <div id="root">
            <Typography>
                <div className={classes.title}>{blog.title ? blog.title : 'Title'}</div>
                <div dangerouslySetInnerHTML={{ __html: content}}></div>
            </Typography>
        </div>
    )
}

export default withStyles(styles)(BlogPost)
