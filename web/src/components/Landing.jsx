import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Navbar from './Navbar'
import Footer from './Footer'
import Splash from './Landing/Splash'
import Pricing from './Landing/Pricing'

const styles = (theme) => ({
    root: {
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
    },
})

const Landing = ({classes}) => {

    return(
        <div className={classes.root}>
            <Navbar />
            <Splash />
            <Pricing />
            <Footer />
        </div>
    )
}

export default withStyles(styles)(Landing)
