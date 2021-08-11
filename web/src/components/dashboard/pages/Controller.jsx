import { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'

import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import SortIcon from '@material-ui/icons/Sort';

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
    // Manage search. Debounce 1 second.
    const [search, setSearch] = useState("")
	const handleSearch = (e) => {
        debouncedSearch(e.target.value)
	}
    const debouncedSearch = useCallback(
        debounce(key => setSearch(key), 1000)
    )

    // Manage sort.
    const [sort, setSort] = useState("")
    const handleSort = (e) => {
        setSort(e.target.value)
    }

    // Set default values from parent on load, update control on change.
    useEffect(() => {
        setSearch(control.search)
        setSort(control.sort)
    }, [])
    useEffect(() => {
        if (search !== control.search) {
            setControl({...control, search})
        }
        if (sort !== control.sort) {
            setControl({...control, sort})
        }
    }, [search, sort])

    // TODO: Make type-specific sort options
    const [sortOptions, setSortOptions] = useState("")
    useEffect(() => {
        setSortOptions([
            <MenuItem value={'recent'}>Recent</MenuItem>,
            <MenuItem value={'oldest'}>Oldest</MenuItem>,
            <MenuItem value={'top'}>Top</MenuItem>
        ])
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
                    IconComponent={SortIcon}
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
