import { useState, useEffect } from 'react'
import { Card, withStyles, Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button';

let styles = () => ({
    default: {
        display: 'flex',
        flexDirection: 'column',
        alignContents: 'flex-start',
        margin: '5px',
        padding: '5px',
        backgroundColor: '#f5f5f5',
    },
    attribute: {
        borderRadius: '12px',
        height: '24px',
        '&:hover': {
            cursor: 'default',
        }
    }
})


const Attribute = ({type, value, classes}) => {

    const [err, setErr] = useState(null)
    const [color, setColor] = useState("")
    useEffect(() => {
        switch(type) {
            case 'label': {
                setColor('default')
                break
            }
            case 'tok': {
                setColor('link')
                break
            }
            default: {
                setErr('Unrecognized Type')
            }
        }
    }, [])

    return(
        <>
            {err
                ? <div>{err}</div>
                : <Button
                    size='small'
                    variant='contained'
                    color={color}
                    classes={{root: classes.attribute}}
                >{value}</Button>
            }
        </>
    )
}

export default withStyles(styles)(Attribute)
