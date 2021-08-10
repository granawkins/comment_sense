import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
    ...theme.typography,
    root: {
        textAlign: 'center',
        width: '100%',
    },
    error: {
        width: '100%',
        textAlign: 'center',
        color: 'gray',
        padding: '20px',
        fontWeight: '400',
    },
})

const ErrorPage = ({classes}) => {
    return (
        <div className={classes.root}>
            <Typography className={classes.error}>ERROR</Typography>
        </div>
    )
}

export default withStyles(styles)(ErrorPage)
