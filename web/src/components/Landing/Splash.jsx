import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import iPhoneFrame from '../../assets/iphone-frame.png'
import demoGif from '../../assets/demo-gif.gif'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        margin: '0',
        paddingTop: '10px',
    },
    imageBlock: {
        position: 'relative',
        width: '150px',
    },
    iPhoneFrame: {
        position: 'relative',
        zIndex: 20,
        position: 'relative',
        top: 0,
        left: 0,
        padding: '10px',
        width: '100%',
    },
    demoGif: {
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '18px 0 0 20px',
        width: '130px',
    }
})

const Splash = ({classes}) => {
    
    return(
        <div className={classes.root}>
            <div>
                <Typography variant='h2'>
                    Better{<br/>}YouTube{<br/>}comments.
                </Typography>
                <Typography variant='body1'>
                    <ul>
                        <li>Scan hundreds of comments in seconds</li>
                        <li>Clustered by topic</li>
                        <li>AI-powered sentiment analysis</li>
                        <li style={{fontWeight: '800'}}>Get the full picture</li>
                    </ul>
                </Typography>
            </div>
            <div className={classes.imageBlock}>
                <img src={iPhoneFrame} className={classes.iPhoneFrame}></img>
                <img src={demoGif} className={classes.demoGif}></img>
            </div>
        </div>
    )
}

export default withStyles(styles)(Splash)

