import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Navbar from './landing/Navbar'
import Footer from './landing/Footer'
import Splash from './landing/Splash'
import Pricing from './landing/Pricing'

const styles = (theme) => ({
    root: {
        position: 'relative',
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
