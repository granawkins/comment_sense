import React from 'react';
import { withStyles } from '@material-ui/core/styles'
import * as Router from 'react-router-dom'

import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'

const styles = (theme) => ({
  root: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: 'white',
    zIndex: '100',
  },
  container: {
    margin: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '400',
  },
  csRed: {
    color: theme.palette.csRed.main,
  },
  enterButton: {
    textTransform: 'none',
    fontSize: '1.1em',
    fontWeight: '200',
    padding: '2px',
  },
})

const Navbar = ({classes}) => {
  return (
    <div className={classes.root}>
      <Box className={classes.container}>
        <Router.Link  to={"/"}>
          <Link component="button" underline="none" color="textPrimary">
            <Box display='flex' flexDirection='row'>
              <Typography className={classes.logoText}>Comment</Typography>
              <Typography className={`${classes.logoText} ${classes.csRed}`}>Sense</Typography>
            </Box>
          </Link>
        </Router.Link>
        <div className={classes.enter}>
          <Button className={classes.enterButton}>Signup</Button>
          <Button className={classes.enterButton}>Login</Button>
        </div>
      </Box>
    </div>
  );
}

export default withStyles(styles)(Navbar)