import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import DeleteIcon from '@material-ui/icons/Delete';

import LoadingCircle from '../../utils/LoadingCircle'
import { Tab } from '@material-ui/core'

const styles = (theme) => ({
    root: {

    },
    activeOption: {
        backgroundColor: 'lightgray'
    },
    field: {
        padding: '0 5px',
    },
    table: {
        minWidth: 650,
    },
    buttonBar: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '30px'
    }
})

const BlogManager = ({posts, blog, setBlog, newPost, removePost, classes}) => {

    const [selected, setSelected] = useState(null)
    const handleClick = (post) => {
        if (selected) {
            let confirmed = window.confirm('All unsaved data will be lost. Would you like to continue?')
            if (!confirmed) {
                return null
            }
        }
        if (post.id === selected) {
            setSelected(null)
            setBlog(null)
        } else {
            setSelected(post.id)
            setBlog(post)
        }
    }

    const handleRemove = (event, post) => {
        removePost(post)
        event.stopPropagation()
    }

    useEffect(() => {
        // Set the selected Post
        if (blog) {
            setSelected(blog.id)
        }
    }, [])

    return(
        <div id="root">
            <Typography variant='h5'>Blog Posts</Typography>
            {posts
                ? <TableContainer component={Paper}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Excerpt</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>Delete</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {posts.map(post => {
                                return (<TableRow hover key={post.id} onClick={() => handleClick(post)}
                                                  role='checkbox' selected={selected === post.id}>
                                    <TableCell><Checkbox checked={selected === post.id} /></TableCell>
                                    <TableCell component="th" scope="row">{post.id}</TableCell>
                                    <TableCell align="right">{post.created ? post.created.slice(5,22) : null}</TableCell>
                                    <TableCell align="right">{post.title}</TableCell>
                                    <TableCell align="right">{post.excerpt}</TableCell>
                                    <TableCell align="right">{post.active}</TableCell>
                                    <TableCell align="right"><DeleteIcon onClick={(e) => handleRemove(e, post)} /></TableCell>
                                </TableRow>)
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                : <LoadingCircle />
            }
            <div className={classes.buttonBar}>
                <Button onClick={newPost} variant='contained' color='secondary'>New Post</Button>
            </div>
        </div>
    )
}

export default withStyles(styles)(BlogManager)
