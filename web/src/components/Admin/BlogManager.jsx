import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
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
})

const BlogManager = ({posts, blog, setBlog, newPost, classes}) => {

    const [selected, setSelected] = useState(null)
    const handleClick = (post) => {
        if (post.id === selected) {
            setSelected(null)
            setBlog(null)
        } else {
            setSelected(post.id)
            setBlog(post)
        }
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
            {posts.length > 0
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
                                    <TableCell align="right">Erase</TableCell>
                                </TableRow>)
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                : <LoadingCircle />
            }
            <Button onClick={newPost}>New Post</Button>
        </div>
    )
}

export default withStyles(styles)(BlogManager)
