import { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'

import ReactQuill from 'react-quill'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        margin: '0',
        paddingTop: '10px',
        maxWidth: '768px',
    },
    blogEditor: {
        marginTop: '20px',
        backgroundColor: '#f5f5f5',
    },
    inputField: {
        marginTop: '10px',
    },
    buttonContainer: {
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    publish: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
})

const BlogEditor = ({blog, updateBlog, classes}) => {

    // Manage active post data
    const [id, setId] = useState("")
    const [title, setTitle] = useState("")
    const [permalink, setPermalink] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [blogContent, setBlogContent] = useState("")
    const [postActive, setPostActive] = useState("")

    useEffect(() => {
        setId(blog.id)
        setTitle(blog.title)
        setPermalink(blog.permalink)
        setExcerpt(blog.excerpt)
        setBlogContent(blog.content)
        setPostActive(blog.active)
    }, [blog])

    const saveChanges = () => {
        updateBlog({
            id: id,
            title: title,
            permalink: permalink,
            excerpt: excerpt,
            content: blogContent,
            active: postActive,
        })
    }

    // Setup Quill Editor
    function addCss(fileName) {
        var head = document.head;
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = fileName;
        head.appendChild(link);
    }
    useEffect(() => {
        addCss('//cdn.quilljs.com/1.3.6/quill.snow.css')
    }, [])
    const modules = {
        toolbar: [
          [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
          [{size: []}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'},
           {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'image', 'video'],
          ['clean']
        ],
        clipboard: {
          // toggle to add extra line breaks when pasting HTML:
          matchVisual: false,
        }
    }
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ]

    return(
        <div className={classes.root}>
            <Typography>Post ID: {blog.id}</Typography>
            <TextField
                id="title"
                className={classes.inputField}
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="The title of the blog post."
            />
            <TextField
                id="permalink"
                className={classes.inputField}
                label="Permalink"
                value={permalink}
                onChange={(e) => setPermalink(e.target.value)}
                helperText="The url suffix"
            />
            <div id='blog-editor' className={classes.blogEditor}>
                <ReactQuill
                    theme='snow'
                    onChange={setBlogContent}
                    value={blogContent}
                    modules={modules}
                    formats={formats}
                    placeholder='Write a blog'
                />
            </div>
            <TextField
                id="excerpt"
                className={classes.inputField}
                label="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                helperText="Information that will be displayed in search results"
            />
            <div className={classes.publish}>
                <Typography>Published: </Typography>
                <Switch
                    checked={postActive}
                    onChange={(e) => setPostActive(e.target.checked)}
                    name="Published"
                />
            </div>
            <div className={classes.buttonContainer}>
                <Button variant='contained' color='secondary' onClick={saveChanges}>Save Changes</Button>
            </div>
        </div>
    )
}

export default withStyles(styles)(BlogEditor)
