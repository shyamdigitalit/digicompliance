// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      white: '#ffffffff',
      black: '#000000ff',
      lightbg: '#f0fdfaef',
      darkbg: '#0b1f14ff',
      light: '#78ffc2ff',
      main:  '#00ff8cff',
      dark:  '#1b3027ff',
      textLight: '#d9ffeeff',
      textDark: '#00140bff',
      boxShadow: '0.1rem 0.1rem 1rem #e4e9e6ef inset'
    },
    alternate: {
      lightbg: '#dce0dfef',
      darkbg: '#161817ff',
      light: '#e6ff78ff',
      main:  '#ddff00ff',
      dark:  '#2c301bff',
      textLight: '#f5ffd9ff',
      textDark: '#0c1400ff',
    },
    // You can also override secondary, error, background, etc.
    secondary: {
      main: '#28936dff',
    },
    background: {
      default: '#f5f5f5',
    },
    loginCard: {
      main: '#dbede1ff',
      boxShadow: '0.01rem 0.01rem 1rem #718b7fff',
      borderRadius: '2.5rem',
      labelColor: '#1b3027ff',
      // focusUnderlineColor: '#1b3027ff',
      focusUnderlineColor: 'transparent',
    },
    formField: {
      wd: '100%',
      p: '1rem',
      m: '1rem',
      brds: '5rem',
      bxshd: '0.01rem 0.01rem 1rem #8fb1a1ff',
    },
    button: {
      dark: {
        primary: { bg: '#00ff8cff', colr: '#00140bff'},
        secondary: { bg: '#165f3bff', colr: '#8de9b2ff'},
        borderRadius: '5rem',
      },
      light: {
        primary: { bg: '#00875eff', colr: '#bbc0beff'},
        secondary: { bg: '#00140bff', colr: '#afe2ceff'},
        borderRadius: '5rem',
      },
    },
  },
  // (Optional) You can override typography, spacing, components, etc.
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
