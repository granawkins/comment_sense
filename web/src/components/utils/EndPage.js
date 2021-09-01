import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
    ...theme.typography,
    root: {
        textAlign: 'center',
        width: 'inherit',
    },
    error: {
        width: '100%',
        textAlign: 'center',
        color: 'gray',
        fontWeight: '400',
    },
})

const EndPage = ({classes}) => {
    return (
        <div className={classes.root}>
            <Typography className={classes.error}>END OF FEED</Typography>
        </div>
    )
}

export default withStyles(styles)(EndPage)
