import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

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
})

const BlogEditor = ({blogContent, setBlogContent, classes}) => {

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
        <div id="blog-editor">
            <ReactQuill
                theme='snow'
                onChange={setBlogContent}
                value={blogContent}
                modules={modules}
                formats={formats}
                placeholder='Write a blog'
            />
        </div>
    )
}

export default withStyles(styles)(BlogEditor)