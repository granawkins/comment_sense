import { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'

import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import { capitalize } from '../../utils/helpers'

const styles = (theme) => ({
    ...theme.typography,
    root: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'center',
        width: '100%',
        margin: '0',
        padding: '0',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    search: {
        flexGrow: '1',
    },
    spacer: {
        width: '100px',
    },
    sort: {
        minWidth: '120px',
    },
})

const Controller = ({type, control, setControl, classes}) => {

    const [search, setSearch] = useState("")
    const debouncedSearch = useCallback(
        debounce(key => setSearch(key), 1000)
    )
	const handleSearch = (e) => {
		debouncedSearch(e.target.value)
	}
    useEffect(() => {
        if (search !== control.search) {
            setControl({...control, search})
        }
    }, [search])

    const [sort, setSort] = useState("")
    const handleSort = (e) => {
        setSort(e.target.value)
    }

    const [sortOptions, setSortOptions] = useState("")
    useEffect(() => {
        let recentFunction
        let topFunction
        switch(type) {
            case 'videos': {
                recentFunction = 'published'
                topFunction = 'n_analyzed'
                break
            }
            case 'topics': {
                recentFunction = 'created'
                topFunction = 'score'
                break
            }
            default: break
        }
        setSortOptions([
            <MenuItem value={'published'} active>Recent</MenuItem>,
            <MenuItem value={topFunction}>Top</MenuItem>
        ])
        setSort(recentFunction)
    }, [type])

    return(
        <Container className={classes.root}>
            <div className={classes.row}>
                <TextField
                  placeholder="Search"
                  classes={{
                      root: `${classes.h6} ${classes.search}`,
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={handleSearch}
                />
                <div className={classes.spacer} />
                <Select
                    value={sort}
                    onChange={handleSort}
                    classes={{
                        root: `${classes.h6} ${classes.sort}`,
                    }}
                >
                    {sortOptions}
                </Select>
            </div>
        </Container>
    )
}

export default withStyles(styles)(Controller)
