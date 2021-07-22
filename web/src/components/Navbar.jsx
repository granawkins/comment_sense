import React from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import * as Router from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SearchBar from "material-ui-search-bar";
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  title: {
    display: 'flex',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(3),
    width: 'auto',

    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
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
  mobileSearchIcon: {
      display: 'flex',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
  },
  mobileSearchMenuList: {
      paddingTop: 0,
      paddingBottom: 0,
  },
  mobileSearchMenuPaper: {
      width: '100%',
  },
  inputRoot: {
    color: 'inherit',
    width: '300px',
  },
  toolbarClass: {
    minHeight: '48px',
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
  menuBar: {
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  logo: {
    fontWeight: '400'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  menuButton: {
    width: '200px',
    height: '30px',
  },
  buttonsPanel: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  topLink: {
    width: '90px',
    height: '30px',
  }
}));

export default function Navbar() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileSearch, setMobileSearch] = React.useState(null);
  const [searchValue, setSearchValue] = React.useState("");

  const isMenuOpen = Boolean(anchorEl);
  const isSearchOpen = Boolean(mobileSearch);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchOpen = (event) => {
    setMobileSearch(event.currentTarget)
  }

  const handleSearchClose = () => {
    setMobileSearch(null);
  }

  const search = () => {
    window.location.href = '/search/' + searchValue
  }

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    //   zIndex="snackbar"
    >
      <Router.Link to="/admin" className={classes.link}>
        <MenuItem onClick={handleMenuClose} className={classes.menuButton}>Admin</MenuItem>
      </Router.Link>
    </Menu>
  );

  const searchId = 'mobile-search-bar'
  const renderSearch = (
    <Menu
        anchorEl={document.getElementById('navbar')}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        id={searchId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={isSearchOpen}
        onClose={handleSearchClose}
        // zIndex="snackbar"
        classes={{
            list: classes.mobileSearchMenuList,
            paper: classes.mobileSearchMenuPaper,
        }}
    >
        <div>
            <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder='Search YouTube'
                onRequestSearch={() => search()}
            />
        </div>
    </Menu>
  )

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      search()
    }
  }

  return (
    <div>
      <AppBar id="navbar" position="absolute" className={classes.menuBar}>
        <Toolbar variant="dense" className={classes.toolbarClass}>
        <Grid container spacing={3} alignItems="center">

          {/* Logo */}
          <Grid item xs display="inline">
            <Router.Link  to={"/"}>
              <Link
                  component="button"
                  underline="none"
                  color="textPrimary"
              >
                  <Typography display="inline" variant="h6" className={classes.logo}>Comment</Typography>
                  <Typography display="inline" variant="h6" color="secondary" className={classes.logo}>Sense</Typography>
              </Link>
            </Router.Link>
          </Grid>

          <Grid item sm className={classes.buttonsPanel}>
            <Router.Link to={'/top'} className={classes.link}>
              <Button className={classes.topLink}>Top</Button>
            </Router.Link>
            <Router.Link to={'/recent'} className={classes.link}>
              <Button className={classes.topLink}>Recent</Button>
            </Router.Link>
          </Grid>

          {/* Desktop Search Bar */}
          <Grid item sm>
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
          </Grid>
          <Grid container item xs direction="row" alignContent="flex-end" justifyContent="flex-end">

            {/* Mobile Search Button */}
            <IconButton
                aria-label="search"
                color="inherit"
                onClick={handleSearchOpen}
                className={classes.mobileSearchIcon}
            >
                <SearchIcon />
            </IconButton>

            {/* Menu Button */}
            <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                >
                <AccountCircle />
            </IconButton>
          </Grid>
        </Grid>
        {renderSearch}
        {renderMenu}
        </Toolbar>
      </AppBar>
      <Toolbar className={classes.toolbarClass}/>
    </div>
  );
}
