import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E07A5F', // Terracotta
      light: '#F2CC8F',
      dark: '#C1666B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3D405B', // Deep blue
      light: '#81B29A',
      dark: '#2B2D42',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    },
    divider: '#3D3D3D',
  },
  typography: {
    fontFamily: '"Playfair Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h4: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    body1: {
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #2B2D42 30%, #3D405B 90%)',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#2D2D2D',
          borderRight: '1px solid #3D3D3D',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#2D2D2D',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease-in-out',
          '&.MuiButton-contained': {
            background: 'linear-gradient(45deg, #E07A5F 30%, #C1666B 90%)',
            boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #C1666B 30%, #E07A5F 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#3D3D3D',
            },
            '&:hover fieldset': {
              borderColor: '#E07A5F',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E07A5F',
            },
            '& input': {
              color: '#E0E0E0',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#B0B0B0',
            '&.Mui-focused': {
              color: '#E07A5F',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#2D2D2D',
          border: '1px solid #3D3D3D',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: 'rgba(224, 122, 95, 0.08)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#3D3D3D',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.05)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

export default theme; 