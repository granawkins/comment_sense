import { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/core/styles'
import _ from 'lodash'

import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'

import ReactQuill, { Quill } from 'react-quill'
import ImageUploader from "quill-image-uploader"
Quill.register("modules/imageUploader", ImageUploader)

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
        backgroundColor: 'white',
    },
    inputField: {
        marginTop: '10px',
    },
    buttonContainer: {
        marginTop: '30px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    publish: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    thumbnailSection: {
        border: '1px solid gray',
        padding: '10px',
        marginTop: '15px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'bottom',
    }
})

const BlogEditor = ({blog, setBlog, updateBlog, classes}) => {

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
    }, [])

    useEffect(() => {
        setBlog(prevBlog => ({
            ...prevBlog,
            title: title,
            permalink: permalink,
            excerpt: excerpt,
            content: blogContent,
            postActive: postActive
        }))
    }, [title, permalink, excerpt, blogContent, postActive])

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

    const [thumbnail, setThumbnail] = useState(null)
    const handleThumbnail = async (e) => {
        let file = e.target.files[0];
        const formData = new FormData()
        formData.append("image", file)
        console.log(formData)

        fetch("https://api.imgbb.com/1/upload?key=d36eb6591370ae7f9089d85875e56b22",
              {method: "POST", body: formData})
            .then(response => response.json())
            .then(result => {
                setThumbnail(result.data.url)
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
    const [modules, setModules] = useState(null)
    const [formats, setFormats] = useState(null)
    useEffect(() => {
        addCss('//cdn.quilljs.com/1.3.6/quill.snow.css')
        setModules({
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
            },
            // ref: https://codesandbox.io/s/react-quill-demo-qr8xd?file=/src/editor.js:517-1216
            imageUploader: {
                upload: file => {
                    return new Promise((resolve, reject) => {
                        const formData = new FormData()
                        formData.append("image", file)

                        fetch("https://api.imgbb.com/1/upload?key=d36eb6591370ae7f9089d85875e56b22",
                              {method: "POST", body: formData})
                            .then(response => response.json())
                            .then(result => {
                                console.log(formData)
                                resolve(result.data.url)
                            })
                        .catch(error => {
                            reject("Upload failed")
                            console.error("Error:", error)
                        })
                    })
                }
            }
        })
        setFormats([
            'header', 'font', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image', 'video',
        ])
    }, [])

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
            <div className={classes.thumbnailSection}>
                <Button variant='contained' component='label'>
                    Upload Thumbnail
                    <input type="file" hidden onChange={e => handleThumbnail(e)}/>
                </Button>
                {thumbnail
                    ? <img src={thumbnail}></img>
                    : null
                }
            </div>
            <div id='blog-editor' className={classes.blogEditor}>
                {(modules && formats)
                    ? <ReactQuill
                        theme='snow'
                        onChange={setBlogContent}
                        value={blogContent}
                        modules={modules}
                        formats={formats}
                        placeholder='Write a blog'
                    />
                    : null
                }

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
