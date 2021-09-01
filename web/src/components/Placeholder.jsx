import { useParams } from 'react-router'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
    root: {
        padding: '30px',
        minHeight: '400px',
        backgroundColor: theme.palette.primary.main,
    },
})

const Placeholder = ({classes}) => {
    const params = useParams()
    const activePage = params.page


    return(
        <div className={classes.root}>
           <Typography variant='h3'>
               {activePage} placeholder
           </Typography>
        </div>
    )
}

export default withStyles(styles)(Placeholder)
