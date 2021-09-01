import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { useParams } from 'react-router'

const styles = (theme) => ({
    root: {
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0',
        margin: '30px 0',
        boxSizing: 'border-box',
    },
    paper: {
        width: '100%',
        padding: '5%',
        boxSizing: 'border-box',
        [theme.breakpoints.up('sm')]: {
            width: '480px',
        },
        [theme.breakpoints.up('md')]: {
            width: '768px',
        },
    },
    title: {
        fontSize: '1.5em',
        fontWeight: '400',
    },
    content: {
        "& img": {
            width: '100%',
        }
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
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography>
                    <div className={classes.title}>{blog.title ? blog.title : 'Title'}</div>
                    <div className={classes.content} dangerouslySetInnerHTML={{ __html: content}}></div>
                </Typography>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(BlogPost)
