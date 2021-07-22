import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

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
    inputField: {
        marginTop: '20px',
    },
    blogEditor: {
        marginTop: '30px',
    },
    buttonContainer: {
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
})

const BlogEditor = ({setBlog, classes}) => {

    const [title, setTitle] = useState("")
    const [permalink, setPermalink] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [blogContent, setBlogContent] = useState("")

    useEffect(() => {
        setBlog({
            title: title,
            permalink: permalink,
            excert: excerpt,
            content: blogContent,
        })
    }, [title, permalink, excerpt, blogContent])

    // Add default stylesheet (snow)
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
            <Typography variant='h5'>Post Details</Typography>
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
            <TextField
                id="excerpt"
                className={classes.inputField}
                label="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                helperText="Information that will be displayed in search results"
            />
            <div id='blog-editor' className={classes.blogEditor}>
                <Typography variant='h5'>Post Content</Typography>
                <ReactQuill
                    theme='snow'
                    onChange={setBlogContent}
                    value={blogContent}
                    modules={modules}
                    formats={formats}
                    placeholder='Write a blog'
                />
            </div>
            <div className={classes.buttonContainer}>
                <Button variant='contained' color='primary'>Save Draft</Button>
                <Button variant='contained' color='secondary'>Submit</Button>
            </div>
        </div>
    )
}

export default withStyles(styles)(BlogEditor)
