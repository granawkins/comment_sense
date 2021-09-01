import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'

const switchStyles = (theme) => ({
    switchBase: {
        '&$checked': {
          color: theme.palette.csRed.main,
        },
        '&$checked + $track': {
          backgroundColor: theme.palette.csRed.main,
        },
      },
      checked: {},
      track: {},
})

export default withStyles(switchStyles)(Switch)
