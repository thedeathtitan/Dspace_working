import { createTheme } from '@mui/material/styles';

// Convert Tailwind colors to MUI theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007acc', // primary-500
      light: '#339fff', // primary-400
      dark: '#0062a3', // primary-600
      50: '#e6f3ff',
      100: '#cce7ff',
      200: '#99cfff',
      300: '#66b7ff',
      400: '#339fff',
      500: '#007acc',
      600: '#0062a3',
      700: '#004a7a',
      800: '#003152',
      900: '#001929',
    },
    secondary: {
      main: '#0ea5e9', // secondary-500
      light: '#38bdf8', // secondary-400
      dark: '#0284c7', // secondary-600
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    success: {
      main: '#10b981', // accent-500
      light: '#34d399', // accent-400
      dark: '#059669', // accent-600
    },
    warning: {
      main: '#f59e0b', // action color
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#0a0a0a', // bg-base
      paper: '#1e1e1e', // surface
    },
    text: {
      primary: '#ffffff', // text-primary
      secondary: '#cccccc', // text-secondary
    },
    divider: '#333333', // separator
  },
  typography: {
    fontFamily: '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '34px',
      lineHeight: '120%',
      fontWeight: 600,
    },
    h2: {
      fontSize: '28px',
      lineHeight: '120%',
      fontWeight: 600,
    },
    h3: {
      fontSize: '22px',
      lineHeight: '120%',
      fontWeight: 600,
    },
    h4: {
      fontSize: '17px',
      lineHeight: '120%',
      fontWeight: 600,
    },
    h5: {
      fontSize: '15px',
      lineHeight: '120%',
      fontWeight: 600,
    },
    h6: {
      fontSize: '13px',
      lineHeight: '120%',
      fontWeight: 600,
    },
    body1: {
      fontSize: '15px',
      lineHeight: '120%',
      letterSpacing: '-0.2px',
    },
    body2: {
      fontSize: '13px',
      lineHeight: '120%',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        contained: {
          boxShadow: '0px 0px 20px rgba(0, 122, 204, 0.3)',
          '&:hover': {
            boxShadow: '0px 0px 20px rgba(16, 185, 129, 0.3)',
            transform: 'scale(1.05)',
          },
        },
        outlined: {
          borderColor: '#333333',
          '&:hover': {
            borderColor: '#007acc',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1e1e1e',
            borderColor: '#333333',
            '&:hover': {
              borderColor: '#007acc',
            },
            '&.Mui-focused': {
              borderColor: '#007acc',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          border: '1px solid #333333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          border: '1px solid #333333',
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.3), 0px 2px 4px -1px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.4), 0px 4px 6px -2px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  },
});

export default theme; 