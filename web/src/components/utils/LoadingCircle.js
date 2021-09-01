import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
    ...theme.typography,
    root: {
        textAlign: 'center',
        width: '100%',
    },
    csRed: {
        color: theme.palette.csRed.main,
    },
})

const LoadingCircle = ({classes}) => {
    return (
        <div className={classes.root}>
            <CircularProgress className={classes.csRed} />
        </div>
    )
}

export default withStyles(styles)(LoadingCircle)
