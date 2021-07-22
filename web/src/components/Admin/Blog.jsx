import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'

import { postData } from '../../utils/helpers'
import BlogManager from './BlogManager'
import BlogEditor from './BlogEditor'
import BlogPost from './BlogPost'

// This component is based on the first example ('Simple tabs') here:
// https://material-ui.com/components/tabs/

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        margin: '0',
        paddingTop: '10px',
        maxWidth: '768px',
    },
    tabBar: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    }
})

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
            <Box p={3}>
                <Typography>{children}</Typography>
            </Box>
            )}
        </div>
    );
}

const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const blankPost = (id) => {
    return {
        id: id,
        title: "",
        permalink: "",
        excerpt: "",
        content: "",
        active: false,
    }
}

const Blog = ({classes}) => {

    const [posts, setPosts] = useState([])
    const [maxId, setMaxId] = useState(0)
    const getPosts = async() => {
        fetch(`/api/blogs`)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setPosts(data.posts)
            })
    }

    const newPost = () => {
        let newPost = blankPost(maxId + 1)
        setMaxId(id => id + 1)
        setPosts(oldPosts => [...oldPosts, newPost])
        setBlog(newPost)
    }

    const uploadPost = async (post) => {
        const result = await postData('/api/add_blog', post)
        console.log(result)
        return result.successful
    }

    useEffect(() => {
        getPosts()
    }, [])

    const [active, setActive] = useState(0)
    const handleChange = (event, newValue) => {
        setActive(newValue);
    };

    const [blog, setBlog] = useState(null)
    const updateBlog = async (newBlog) => {
        setBlog(newBlog)
        uploadPost(newBlog)
        setPosts(posts => posts.map(post => {
            if (post.id === newBlog.id) {
                return newBlog
            } else {
                return post
            }
        }))
    }

    return(
        <div className={classes.root}>
            <div className={classes.tabBar}>
                <Tabs value={active} onChange={handleChange}>
                    <Tab label="Manager" {...a11yProps(0)} />
                    <Tab label="Editor" {...a11yProps(1)} disabled={!blog} />
                    <Tab label="Preview" {...a11yProps(2)} disabled={!blog} />
                </Tabs>
            </div>
            <TabPanel value={active} index={0}>
                <BlogManager posts={posts} blog={blog} setBlog={setBlog} newPost={newPost}/>
            </TabPanel>
            <TabPanel value={active} index={1}>
                <BlogEditor blog={blog} updateBlog={updateBlog} />
            </TabPanel>
            <TabPanel value={active} index={2}>
                <BlogPost blog={blog} />
            </TabPanel>
        </div>
    )
}

export default withStyles(styles)(Blog)
