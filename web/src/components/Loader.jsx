import { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles';

import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

const BarLoader = withStyles((theme) => ({
    root: {
      height: 10,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar1Buffer: {
        height: 10,
        borderRadius: 5,
        backgroundColor: 'black',
    },
    bar2Buffer: {
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
}))(LinearProgress);


const styles = (theme) => ({
    root: {
        flexGrow: 1,
        textAlign: 'center',
        padding: '20px',
    },
})

const Loader = ({ target, progress, classes }) => {
    
    const [mainBar, setMainBar] = useState(0)
    const [secondaryBar, setSecondaryBar] = useState(0)
    const [display, setDisplay] = useState("Loading...")
    useEffect(() => {
        if (progress.analyzed) {
            setMainBar(Math.min(100, (progress.analyzed/target)*100))
        }
        if (progress.loaded) {
            setSecondaryBar(Math.min(100, (progress.loaded/target)*100))
        }
        switch(progress.status) {
            case 'api': setDisplay("Getting comment data from YouTube api..."); break;
            case 'init': setDisplay("Initializing Web Scraper..."); break;
            case 'load': setDisplay("Loading video on YouTube..."); break;
            case 'scrape': setDisplay("Scraping comments..."); break;
            case 'analyze': setDisplay("Analyzing comments..."); break;
            case 'done': setDisplay("Preparing results..."); break;
            default: setDisplay(""); break;
        }
    }, [target, progress])

    return (
        <div className={classes.root}>
            <BarLoader 
                variant="buffer" 
                value={mainBar} // {progress * 100}
                valueBuffer={secondaryBar}
            />
            <Typography>
                {display}
            </Typography>
        </div>
    )
}

export default withStyles(styles)(Loader)
