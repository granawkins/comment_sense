import { createTheme } from '@material-ui/core/styles';

const csRed = '#B70000'
const lightWeight = '200'
const boldWeight = '600'

const getTheme = () => {
    const theme = createTheme({
        typography: {
            fontFamily: ['Roboto'],
            h1: {
                fontSize: '2.5em',
                fontWeight: '800',
                lineHeight: '1',
            },
            h3: {
                fontSize: '2em',
                fontWeight: boldWeight,
            },
            h4: {
                fontSize: '2em',
                fontWeight: lightWeight,
                color: csRed,
            },
            h5: {
                fontSize: '1.2em',
                fontWeight: boldWeight,
            },
            h6: {
                fontSize: '1.2em',
                fontWeight: lightWeight,
            },
            body1: {
                fontSize: '1em',
                fontWeight: lightWeight,
            },
        },
        overrides: {
            MuiCssBaseline: {
                '@global': {
                '@font-face': 'Roboto',
                },
            },
        },
        palette: {
            primary: {
                main: '#F5F5F5',
                dark: '#1E1E1E',
            },
            secondary: {
                main: '#FFFFFF',
                dark: '#252526',
            },
            error: {
                main: '#B70000',
                dark: '#FFFFFF',
            },
            csRed: {
                main: csRed,
                dark: '#8B0000',
            },
            faded: {
                main: '#7D7D7D',
            },
        },
        components: {
            MuiButton: {
                variants: [

                ]
            }
        }
    })
    return theme
}

export default getTheme
