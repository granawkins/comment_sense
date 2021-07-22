import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
    root: {

    },
    activeOption: {
        backgroundColor: 'lightgray'
    },
    field: {
        padding: '0 5px',
    }
})

const BlogManager = ({blog, setBlog, classes}) => {

    const [posts, setPosts] = useState([])
    useEffect(() => {
        const blankPost = (i) => {
            return {
                postId: `0000${i}`,
                title: `Title ${i}`,
                permalink: `permalink_${i}`,
                excerpt: `Excerpt ${i}`,
                content: `Content ${i}`,
            }
        }
        for (let i = 0; i < 5; i++) {
            let newPost = blankPost(i)
            setPosts(oldPosts => [...oldPosts, newPost])
        }
    }, [])

    const [selected, setSelected] = useState(null)
    const handleClick = (i) => {
        setSelected(i)
        setBlog(posts[i])
    }

    return(
        <div id="root">
            <Typography variant='h5'>Blog Posts</Typography>
            <List>
                {posts.map((post, i) => {
                    return (
                        <ListItem
                            key={post.permalink}
                            className={i === selected ? classes.activeOption : ""}
                            button
                            dense
                            onClick={() => handleClick(i)}
                        >
                            <Typography className={classes.field}>{post.postId}</Typography>
                            <Typography className={classes.field}>{post.title}</Typography>
                        </ListItem>
                    )
                })}
            </List>
        </div>
    )
}

export default withStyles(styles)(BlogManager)
