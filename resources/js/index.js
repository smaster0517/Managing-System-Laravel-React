import React from 'react';
import ReactDOM from 'react-dom';

// ==== Importação do componente que unifica o sistema de roteamento ==== //
import { ReactRoutes } from "./routes/ReactRouter";

// ==== Importação do provider do state global AuthenticationContext ==== //
import { AuthProvider } from './components/context/InternalRoutesAuth/AuthenticationContext';

// ==== IMportação do provider do state global de paginação ==== //
import { PaginationProvider } from "./components/context/Pagination/PaginationContext";

import { createTheme, ThemeProvider } from '@mui/material/styles'; // Para criar e injetar o objeto do Tema 
import CssBaseline from '@mui/material/CssBaseline';

let theme = createTheme({
    palette: {
      primary: {
        light: '#63ccff',
        main: '#009be5',
        dark: '#006db3',
      },
    },
    typography: {
      h5: {
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: 0.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiTab: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
    mixins: {
      toolbar: {
        minHeight: 48,
      },
    },
  });
  
  theme = {
    ...theme,
    components: {
      // Barra lateral esquerda
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#081627',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            backgroundColor: "#233143"
          },
          contained: {
            boxShadow: 'none',
            '&:active': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            marginLeft: theme.spacing(1),
          },
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: theme.palette.common.white,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            margin: '0 16px',
            minWidth: 0,
            padding: 0,
            [theme.breakpoints.up('md')]: {
              padding: 0,
              minWidth: 0,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: theme.spacing(1)
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 4,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgb(255,255,255,0.15)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: '#4fc3f7',
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: 14,
            fontWeight: theme.typography.fontWeightMedium,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
            minWidth: 'auto',
            marginRight: theme.spacing(2),
            '& svg': {
              fontSize: 20,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: 32,
            height: 32,
          },
        },
      },
    },
  };

export default function Index() {

    return (
        <>
            <React.StrictMode>
                <AuthProvider>
                    <PaginationProvider>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <ReactRoutes/>
                        </ThemeProvider>
                    </PaginationProvider>
                </AuthProvider>
            </React.StrictMode>
        </>
    );
}

if (document.getElementById('root')) {

    ReactDOM.render(<Index/>, document.getElementById('root'));
}
