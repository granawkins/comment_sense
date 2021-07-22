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

function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const Blog = ({classes}) => {

    const [blog, setBlog] = useState(null)
    const [value, setValue] = useState(0)
    const handleChange = (event, newValue) => {
        setValue(newValue);
      };

    return(
        <div className={classes.root}>
            <div className={classes.tabBar}>
                <Tabs value={value} onChange={handleChange}>
                    <Tab label="Manager" {...a11yProps(0)} />
                    <Tab label="Editor" {...a11yProps(1)} />
                    <Tab label="Preview" {...a11yProps(2)} />
                </Tabs>
            </div>
            <TabPanel value={value} index={0}>
                <BlogManager blog={blog} setBlog={setBlog}/>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <BlogEditor blog={blog} setBlog={setBlog}/>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <BlogPost blog={blog} />
            </TabPanel>
        </div>
    )
}

export default withStyles(styles)(Blog)
