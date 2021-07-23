import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider';

import { postData } from '../../utils/helpers'
import BlogManager from './BlogManager'
import BlogEditor from './BlogEditor'
import FeedCard from '../Feed/FeedCard'
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
                {children}
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
        thumbnail: null,
        excerpt: "",
        content: "",
        active: false,
        created: null,
    }
}

const BlogAdmin = ({classes}) => {

    const [posts, setPosts] = useState(null)
    const [maxId, setMaxId] = useState(0)
    const getPosts = async() => {
        setPosts(null)
        fetch(`/api/blogs`)
            .then(res => res.json())
            .then(data => {
                data.posts.forEach(post => {
                    if (post.id > maxId) {
                        setMaxId(post.id)
                    }
                })
                setPosts(data.posts)
            })
    }

    const uploadPost = async (post) => {
        console.log(post)
        const result = await postData('/api/add_blog', post)
        console.log(result)
        return result.successful
    }

    const removePost = async (post) => {
        const result = await postData('/api/remove_blog', post)
        if (result.successful) {
            getPosts()
        }
        return result.successful
    }

    useEffect(() => {
        getPosts()
    }, [])

    const [active, setActive] = useState(0)
    const handleChange = (event, newValue) => {
        setActive(newValue);
    };

    const newPost = () => {
        let newPost = blankPost(maxId + 1)
        setMaxId(id => id + 1)
        setPosts(oldPosts => [...oldPosts, newPost])
        setBlog(newPost)
        setActive(1)
    }

    const [blog, setBlog] = useState(null)
    const updateBlog = async (newBlog) => {
        setBlog(newBlog)
        let uploadSuccessful = await uploadPost(newBlog)
        if (uploadSuccessful) {
            getPosts()
        } else {
            console.log("upload unsuccessful")
        }
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
                <BlogManager posts={posts} blog={blog} setBlog={setBlog}
                             newPost={newPost} removePost={removePost} />
            </TabPanel>
            <TabPanel value={active} index={1}>
                <BlogEditor blog={blog} setBlog={setBlog} updateBlog={updateBlog} />
            </TabPanel>
            <TabPanel value={active} index={2}>
                <FeedCard type="blog" data={blog} inactive={true}/>
                <BlogPost blog={blog} />
            </TabPanel>
        </div>
    )
}

export default withStyles(styles)(BlogAdmin)
