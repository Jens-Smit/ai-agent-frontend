// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2B6CB0',
      light: '#4299E1',
      dark: '#1A365D',
    },
    secondary: {
      main: '#38B2AC',
      light: '#4FD1C5',
      dark: '#2C7A7B',
    },
    error: {
      main: '#F56565',
      light: '#FC8181',
      dark: '#C53030',
    },
    warning: {
      main: '#ECC94B',
      light: '#F6E05E',
      dark: '#B7791F',
    },
    success: {
      main: '#48BB78',
      light: '#68D391',
      dark: '#2F855A',
    },
    info: {
      main: '#4299E1',
      light: '#63B3ED',
      dark: '#2C5282',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4299E1',
      light: '#63B3ED',
      dark: '#2C5282',
    },
    secondary: {
      main: '#4FD1C5',
      light: '#81E6D9',
      dark: '#2C7A7B',
    },
    error: {
      main: '#FC8181',
      light: '#FEB2B2',
      dark: '#C53030',
    },
    warning: {
      main: '#F6E05E',
      light: '#FAF089',
      dark: '#B7791F',
    },
    success: {
      main: '#68D391',
      light: '#9AE6B4',
      dark: '#2F855A',
    },
    info: {
      main: '#63B3ED',
      light: '#90CDF4',
      dark: '#2C5282',
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#A0AEC0',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
});