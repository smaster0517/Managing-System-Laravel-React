// React 
import * as React from 'react';
// Material UI
import { MenuOpenIcon, AccountCircleIcon, AssessmentIcon, MapIcon, DashboardIcon, AdminPanelSettingsIcon, HelpIcon, AssignmentIcon, ReportIcon, HomeRepairServiceIcon } from '@mui/icons-material';
import { AppBar, IconButton, Toolbar, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
// Custom
import { HeaderMenu } from "../../../structures/header_menu/HeaderMenu";
import { usePage } from '../../../context/PageContext';

export const Header = React.memo((props) => {

  const { onDrawerToggle } = props;
  const { pageIndex } = usePage();

  const pages = [
    { icon: <DashboardIcon />, title: "DASHBOARD" },
    { icon: <AdminPanelSettingsIcon sx={{ mr: 1 }} />, title: "ADMINISTRAÇÃO" },
    { icon: <MapIcon sx={{ mr: 1 }} />, title: "PLANOS DE VOO E LOGS" },
    { icon: <AssignmentIcon sx={{ mr: 1 }} />, title: "ORDENS DE SERVIÇO" },
    { icon: <AssessmentIcon sx={{ mr: 1 }} />, title: "RELATÓRIOS" },
    { icon: <ReportIcon sx={{ mr: 1 }} />, title: "INCIDENTES" },
    { icon: <HomeRepairServiceIcon sx={{ mr: 1 }} />, title: "EQUIPAMENTOS" },
    { icon: <HelpIcon sx={{ mr: 1 }} />, title: "SUPORTE" },
    { icon: <AccountCircleIcon sx={{ mr: 1 }} />, title: "MINHA CONTA" }
  ];

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#fff', boxShadow: 2, zIndex: 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            aria-label="menu"
            onClick={onDrawerToggle}
          >
            <MenuOpenIcon color="success" />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          </Typography>
          <HeaderMenu />
        </Toolbar>
      </AppBar>
      <AppBar position="static" sx={{ boxShadow: 1, bgcolor: '#16529B' }}>
        <Toolbar>
          <Box>
            <Typography variant="h7" fontWeight={600} color={"#fff"}>{pages[pageIndex].title}</Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
});

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
};