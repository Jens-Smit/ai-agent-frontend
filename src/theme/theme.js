import { createTheme } from '@mui/material/styles';

const baseThemeConfig = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.95rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseThemeConfig,
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
});

export const darkTheme = createTheme({
  ...baseThemeConfig,
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
});