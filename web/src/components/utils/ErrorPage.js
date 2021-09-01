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

const ErrorPage = ({classes}) => {
    return (
        <div className={classes.root}>
            <Typography className={classes.error}>ERROR</Typography>
        </div>
    )
}

export default withStyles(styles)(ErrorPage)
