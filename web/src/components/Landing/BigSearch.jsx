import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { alpha, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'nowrap',
        backgroundColor: '#f5f5f5',
        margin: '0',
        width: '80%',
        [theme.breakpoints.up('sm')]: {
            width: '400px',
        },
        [theme.breakpoints.up('md')]: {
            width: '600px',
        },
        padding: '20px',
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        border: '1px solid gray',
        backgroundColor: 'white',
        width: '100%',        
        display: 'flex',
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },    
})

const BigSearch = ({classes}) => {
    
    const [searchValue, setSearchValue] = useState("")

    const search = () => {
        window.location.href = '/search/' + searchValue
    }

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
          search()
        }
    }

    return(
        <div className={classes.root}>
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                <SearchIcon />
                </div>
                <InputBase
                  placeholder="Search YouTube"
                  classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleEnter}
                />
            </div>
        </div>
    )
}

export default withStyles(styles)(BigSearch)

