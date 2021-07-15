import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
    root: {
        padding: '30px',
        minHeight: '400px',
    },
})

const Placeholder = ({pageName, classes}) => {

    return(
        <div className={classes.root}>
           <Typography variant='h3'>
               {pageName}
           </Typography>
        </div>
    )
}

export default withStyles(styles)(Placeholder)
