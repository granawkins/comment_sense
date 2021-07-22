import { useState, useEffect, createContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
    root: {

    },
})

const BlogPost = ({content, classes}) => {

    return(
        <div id="root">
            <div dangerouslySetInnerHTML={{ __html: content}} />
        </div>
    )
}

export default withStyles(styles)(BlogPost)
