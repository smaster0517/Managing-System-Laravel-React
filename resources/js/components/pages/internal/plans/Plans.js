// IMPORTAÇÃO DOS COMPONENTES REACT
import { useState, useEffect } from "react";

// IMPORTAÇÃO DOS COMPONENTES CUSTOMIZADOS
import { usePagination } from "../../../context/Pagination/PaginationContext";
import { useAuthentication } from "../../../context/InternalRoutesAuth/AuthenticationContext";
import style from "./plans.module.css";
import { PlansPanel } from "./plans_panel/PlansPanel";

// IMPORTAÇÃO DOS COMPONENTES MATERIALUI
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box } from "@mui/system";

export function Plans(){

    // Utilizador do contexto/state global de Autenticação
    const {AuthData, setAuthData} = useAuthentication();

    // Atualização do state global da páginação 
    const {actualPage, setActualPage}= usePagination();

    const [newPlanMode, setNewPlanMode] = useState();

    /*
    * Atualização do state global da página atual
    */
    useEffect(() => {
      
      setActualPage("PLANOS DE VÔO");
  
    })

    return(
        <Paper sx={{ maxWidth: "90%", margin: 'auto', overflow: 'hidden', borderRadius: "10px" }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Toolbar />
      </AppBar>
      <Box sx={{ my: 5, mx: 2 }} color="text.secondary">

         <PlansPanel />

     </Box>
    </Paper>
    )
}