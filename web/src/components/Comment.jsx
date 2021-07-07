import { Card, withStyles, Typography } from '@material-ui/core'
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';

let styles = () => ({
    default: {
        display: 'flex',
        flexDirection: 'column',
        alignContents: 'flex-start',
        margin: '5px',
        padding: '5px',
        backgroundColor: '#f5f5f5', 
    }
})


const Comment = (props) => {
    return(
        <Card className={props.classes.default} >
            <Typography color="secondary">{props.comment.author}</Typography>
            <Typography dangerouslySetInnerHTML={{__html: props.comment.text}}></Typography>
            {props.comment.likes
                ? <Typography><ThumbUpAltIcon style={{padding: '0px 10px'}}/>{props.comment.likes}</Typography>
                : ""
            }
        </Card>
    )
}

export default withStyles(styles)(Comment)