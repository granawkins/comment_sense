import { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'

import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import SortIcon from '@material-ui/icons/Sort';
import RefreshIcon from '@material-ui/icons/Refresh';

import Attribute from './feed/Attribute'
import { capitalize } from '../../utils/helpers'
import RedSwitch from '../../utils/RedSwitch'



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
        flexWrap: 'wrap',
        width: '100%',
        marginTop: theme.spacing(1),
    },
    actionButton: {
        backgroundColor: theme.palette.csRed.main,
        color: 'white',
        top: '0',
        margin: '0px 5px',
    },
    search: {
        flexGrow: '1',
    },
    sortIcon: {
        height: '100%',
    },
})

const Controller = ({type, control, setControl, display=null, setDisplay=null, sortOptions=null,
                    allLabels=null, actionMessage=null, action=null, actionLabel=null,
                    refresh=null, lastRefresh=null, classes}) => {

    // Create a popup menu with details/options for main action
    const handleAction = () => {

    }

    // Update control (in parent) when sort and local variables are changed
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState(null)
    const [labels, setLabels] = useState(null)
    useEffect(() => {
        if (search !== control.search) {
            setControl({...control, search})
        }
        if (sort !== control.sort) {
            setControl({...control, sort})
        }
        if (JSON.stringify(labels) !== JSON.stringify(control.labels)) {
            setControl({...control, labels})
        }
    }, [search, sort, labels])

    // Set default values from parent on load.
    useEffect(() => {
        setSearch(control.search)
        setSort(control.sort)
        if (allLabels) {
            setLabels(allLabels.reduce((o, lab) => ({ ...o, [lab]: false}), {}))
        }
    }, [sortOptions, allLabels])

    // Debounce search by 1 second
	const handleSearch = (e) => {
        debouncedSearch(e.target.value)
	}
    const debouncedSearch = useCallback(
        debounce(key => setSearch(key), 1000)
    )

    // If sortOptions are provided, update sort on change
    const handleSort = (e) => {
        setSort(e.currentTarget.dataset.value)
        handleSortClose()
    }
    const [anchorEl, setAnchorEl] = useState(null)
    const handleSortClick = (e) => setAnchorEl(e.currentTarget)
    const handleSortClose = () => setAnchorEl(null)
    const sortOpen = Boolean(anchorEl)

    // Labels are off by default. Click on label to toggle status.
    const handleLabel = (label, status) => {
        const newLabels = JSON.parse(JSON.stringify(labels))
        newLabels[label] = status
        setLabels(newLabels)
    }

    // If sentiment is enabled for user, show toggle and turn on by default
    const toggleSentiment = () => {
        setDisplay({...display, sentimentOn: !display.sentimentOn})
    }
    useEffect(() => {
        if (display && display.sentimentEnabled) {
            setDisplay({...display, sentimentOn: true})
        }
    }, [])

    return(
        <Container className={classes.root}>
            <div className={classes.row}>
                <Typography className={classes.body1}>{actionMessage}</Typography>
                {actionLabel && action
                    ? <Button
                        onClick={action}
                        className={classes.actionButton}
                        variant='contained'
                    >{actionLabel}</Button>
                    : null
                }
                {lastRefresh && refresh
                ? <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <Typography className={classes.body1}>Last updated {lastRefresh}</Typography>
                    <IconButton onClick={refresh}>
                        <RefreshIcon className={classes.sortIcon} />
                    </IconButton>
                </div>
                : null
                }
            </div>
            <div className={classes.row}>
                <TextField
                  placeholder="Search"
                  classes={{
                      root: `${classes.h6} ${classes.search}`,
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={handleSearch}
                />
                {sortOptions
                    ? <>
                        <IconButton onClick={handleSortClick}>
                            <SortIcon className={classes.sortIcon} />
                        </IconButton>
                        <Menu keepMounted anchorEl={anchorEl} open={sortOpen} onClose={handleSortClose}>
                            {sortOptions.map(option => (
                                <MenuItem
                                    key={option}
                                    data-value={option}
                                    onClick={handleSort}
                                    selected={option === sort}
                                >{capitalize(option)}</MenuItem>
                            ))}
                        </Menu>
                    </>
                    : null
                }
            </div>
            <div className={classes.row}>
                {control.labels
                    ? <>
                        {Object.entries(control.labels).map(([key, value]) => (
                            <Attribute type='label' value={key} active={value}
                                    onClick={() => handleLabel(key, !value)} />
                        ))}
                    </>
                    : null
                }
                <div style={{flexGrow: 1}} />
                {display && display.sentimentEnabled
                    ? <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <RedSwitch
                            checked={display.sentimentOn}
                            onChange={toggleSentiment}
                        />
                        <Typography className={classes.body1}>Sentiment</Typography>
                    </div>
                    : null
                }
            </div>
        </Container>
    )
}

export default withStyles(styles)(Controller)
