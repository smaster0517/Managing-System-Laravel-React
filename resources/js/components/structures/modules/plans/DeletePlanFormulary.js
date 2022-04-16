// IMPORTAÇÃO DOS COMPONENTES REACT
import { useState, useEffect } from 'react';
import * as React from 'react';

// IMPORTAÇÃO DOS COMPONENTES MATERIALUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { Alert } from '@mui/material';
import { IconButton } from '@mui/material';
import { Tooltip } from '@mui/material';

// IMPORTAÇÃO DOS COMPONENTES CUSTOMIZADOS
import { useAuthentication } from '../../../context/InternalRoutesAuth/AuthenticationContext';
import { FormValidation } from '../../../../utils/FormValidation';
import AxiosApi from '../../../../services/AxiosApi';
import { GenericSelect } from '../../input_select/GenericSelect';

// IMPORTAÇÃO DOS ÍCONES DO FONTS AWESOME
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

export const DeletePlanFormulary = React.memo(({...props}) => {

// ============================================================================== DECLARAÇÃO DOS STATES E OUTROS VALORES ============================================================================== //

    // Utilizador do state global de autenticação
    const {AuthData, setAuthData} = useAuthentication();

    const [open, setOpen] = useState(false); 

    // State da mensagem do alerta
    const [displayAlert, setDisplayAlert] = useState({display: false, type: "", message: ""});

    // State da acessibilidade do botão de executar o registro
    const [disabledButton, setDisabledButton] = useState(false);

// ============================================================================== FUNÇÕES/ROTINAS DA PÁGINA ============================================================================== //

    // Função para abrir o modal
    const handleClickOpen = () => {

      if(props.selected_record.dom != null){
        setOpen(true);
      } 
        
    };

    // Função para fechar o modal
    const handleClose = () => {

      setDisplayAlert({display: false, type: "", message: ""});
      setDisabledButton(false);

      setOpen(false);

    };

     /*
    * Rotina 1
    * Captura do envio do formulário
    * 
    */ 
    const handleSubmitOperation = (event) => {
      event.preventDefault();

      // Instância da classe JS FormData - para trabalhar os dados do formulário
      const data = new FormData(event.currentTarget);

        // Validação dos dados do formulário
        // A comunicação com o backend só é realizada se o retorno for true
        if(dataValidate(data)){

            // Botão é desabilitado
            setDisabledButton(true);

            // Inicialização da requisição para o servidor
            requestServerOperation(data);  

        }

    }

     /*
    * Rotina 2
    * Validação dos dados no frontend
    * Recebe o objeto da classe FormData criado na rotina 1
    * Se a validação não falhar, a próxima rotina, 3, é a da comunicação com o Laravel 
    */
     function dataValidate(formData){

        const idValidate = formData.get("plan_id") == props.selected_record.data_cells.plan_id ? {error: false, message: null} : {error: false, message: "ID inválido"}

        setDisabledButton(false);
      
        if(idValidate.error){

            setDisplayAlert({display: true, type: "error", message: idValidate.message});

            return false;

        }else{

            return true;

        }

    }

     /*
    * Rotina 3
    * Realização da requisição AXIOS
    * Possui dois casos: o Update e o Delete
    * 
    */ 
    function requestServerOperation(data){

        // Dados para o middleware de autenticação 
        let logged_user_id = AuthData.data.id;
        let module_id = 2;
        let module_action = "escrever";

        setDisabledButton(false);

        AxiosApi.delete(`/api/plans-module/${data.get("plan_id")}?auth=${logged_user_id}.${module_id}.${module_action}`)
        .then(function (response) {

            successServerResponseTreatment();

        })
        .catch(function (error) {
            
            errorServerResponseTreatment(error.response.data);

        });

    }

    /*
    * Rotina 4A
    * Tratamento da resposta de uma requisição bem sucedida
    */
    function successServerResponseTreatment(){

      setDisplayAlert({display: true, type: "success", message: "Operação realizada com sucesso!"});

      setTimeout(() => {

        setDisabledButton(false);

        handleClose();

      }, 2000);

    }

    /*
    * Rotina 4B
    * Tratamento da resposta de uma requisição falha
    */
    function errorServerResponseTreatment(response_data){

      let error_message = (response_data.message != "" && response_data.message != undefined) ? response_data.message : "Houve um erro na realização da atualização!";
      setDisplayAlert({display: true, type: "error", message: error_message});

    }

// ============================================================================== ESTRUTURAÇÃO DA PÁGINA - COMPONENTES DO MATERIAL UI ============================================================================== //

  return (
    <>
        <Tooltip title="Deletar">
            <IconButton disabled={AuthData.data.user_powers["2"].profile_powers.ler == 1 ? false : true} onClick={handleClickOpen}>
                <FontAwesomeIcon icon={faTrashCan} color={AuthData.data.user_powers["2"].profile_powers.ler == 1 ? "green" : "#808991"} size = "sm"/>
            </IconButton>
        </Tooltip>

        {(props.selected_record.dom != null && open) && 

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>DELEÇÃO | PLANO DE VÔO (ID: {props.selected_record.data_cells.plan_id})</DialogTitle>

                {/* Formulário da criação/registro do usuário - Componente Box do tipo "form" */}
                <Box component="form" noValidate onSubmit={handleSubmitOperation} >

                    <DialogContent>

                        <TextField
                        margin="dense"
                        id="plan_id"
                        name="plan_id"
                        label="ID do plano"
                        type="text"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                            readOnly: true
                        }}
                        value={props.selected_record.data_cells.plan_id}
                        />

                        <TextField
                        margin="dense"
                        label="Arquivo"
                        type="text"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                            readOnly: true
                        }}
                        defaultValue={props.selected_record.data_cells.plan_file}
                        />

                    </DialogContent>

                    {displayAlert.display && 
                        <Alert severity={displayAlert.type}>{displayAlert.message}</Alert> 
                    }
                
                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={disabledButton}>Confirmar deleção</Button>
                    </DialogActions>

                </Box>

            </Dialog>
        }
    </>

  );

});