import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

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

const BlogManager = ({posts, blog, setBlog, newPost, classes}) => {

    const [selected, setSelected] = useState(null)
    const handleClick = (i) => {
        if (i === selected) {
            setSelected(null)
            setBlog(null)
        } else {
            setSelected(i)
            setBlog(posts[i])
        }
    }

    // Make sure the active post is highlighted when switch to manager screen
    useEffect(() => {
        if (blog) {
            posts.forEach((post, i) => {
                if (post.id === blog.id) {
                    setSelected(i)
                }
            })
        }
    }, [])

    return(
        <div id="root">
            <Typography variant='h5'>Blog Posts</Typography>
            <List>
                {posts.map((post, i) => {
                    return (
                        <ListItem
                            key={post.id}
                            className={i === selected ? classes.activeOption : ""}
                            button
                            dense
                            onClick={() => handleClick(i)}
                        >
                            <Typography className={classes.field}>{post.id}</Typography>
                            <Typography className={classes.field}>{post.title}</Typography>
                        </ListItem>
                    )
                })}
            </List>
            <Button onClick={newPost}>New Post</Button>
        </div>
    )
}

export default withStyles(styles)(BlogManager)
