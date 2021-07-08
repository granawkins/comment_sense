import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
    root: {
        textAlign: 'center',
        width: '100%',
    }
})

const LoadingCircle = ({classes}) => {
    return (
        <div className={classes.root}>
            <CircularProgress color='secondary'/>
        </div>
    )
}

export default withStyles(styles)(LoadingCircle) 
