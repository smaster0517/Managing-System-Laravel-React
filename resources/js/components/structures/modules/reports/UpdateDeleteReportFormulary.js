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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// IMPORTAÇÃO DOS COMPONENTES CUSTOMIZADOS
import { useAuthentication } from '../../../context/InternalRoutesAuth/AuthenticationContext';
import { FormValidation } from '../../../../utils/FormValidation';
import AxiosApi from '../../../../services/AxiosApi';
import { DateTimeInput } from '../../date_picker/DateTimeInput';

import moment from 'moment';

export const UpdateDeleteReportFormulary = React.memo(({data, operation, refresh_setter}) => {

    // ============================================================================== DECLARAÇÃO DOS STATES E OUTROS VALORES ============================================================================== //

    // Utilizador do state global de autenticação
    const {AuthData} = useAuthentication();

    // States do formulário
    const [open, setOpen] = useState(false);

    // States utilizados nas validações dos campos 
    const [errorDetected, setErrorDetected] = useState({flight_start_date: false, flight_end_date: false, flight_log: false, report_note: false}); // State para o efeito de erro - true ou false
    const [errorMessage, setErrorMessage] = useState({flight_start_date: "", flight_end_date: "", flight_log: "", report_note: ""}); // State para a mensagem do erro - objeto com mensagens para cada campo

    // State da mensagem do alerta
    const [displayAlert, setDisplayAlert] = useState({display: false, type: "", message: ""});

    // State da acessibilidade do botão de executar o registro
    const [disabledButton, setDisabledButton] = useState(false);

    // States dos inputs de data
    const [startDate, setStartDate] = useState(data.flight_start_date);
    const [endDate, setEndDate] = useState(data.flight_end_date);

     // ============================================================================== FUNÇÕES/ROTINAS DA PÁGINA ============================================================================== //

    // Função para abrir o modal
    const handleClickOpen = () => {
        setOpen(true);
    };

    // Função para fechar o modal
    const handleClose = () => {

      setErrorDetected({flight_start_date: false, flight_end_date: false, flight_log: false, report_note: false});
      setErrorMessage({flight_start_date: "", flight_end_date: "", flight_log: "", report_note: ""});
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

      if(operation === "update"){

        // Validação dos dados do formulário
        // A comunicação com o backend só é realizada se o retorno for true
        if(dataValidate(data)){

          if(verifyDateInterval()){

            // Botão é desabilitado
            setDisabledButton(true);

            // Inicialização da requisição para o servidor
            requestServerOperation(data);

          }else{
            
            setDisplayAlert({display: false, type: "", message: "Erro! A data inicial não pode anteceder a final."});

          }

        }

      }else if(operation === "delete"){

          setDisabledButton(true);

         // Inicialização da requisição para o servidor
         requestServerOperation(data, operation);

      }

    }

     /*
    * Rotina 2
    * Validação dos dados no frontend
    * Recebe o objeto da classe FormData criado na rotina 1
    * Se a validação não falhar, a próxima rotina, 3, é a da comunicação com o Laravel 
    */
     function dataValidate(formData){

      const logPattern = "";

      // Se o atributo "erro" for true, um erro foi detectado, e o atributo "message" terá a mensagem sobre a natureza do erro
      const startDateValidate = startDate != null ? {error: false, message: ""} : {error: true, message: "Selecione a data inicial"};
      const endDateValidate = endDate != null ? {error: false, message: ""} : {error: true, message: "Selecione a data final"};
      const noteValidate = FormValidation(formData.get("report_note"), 3, null, null, null);

      setErrorDetected({flight_start_date: startDateValidate.error, flight_end_date: endDateValidate.error, flight_log: false, report_note: noteValidate.error});
      setErrorMessage({flight_start_date: startDateValidate.message, flight_end_date: endDateValidate.message, flight_log: "", report_note: noteValidate.message});
      
      if(startDateValidate.error || endDateValidate.error || noteValidate.error){

        return false;

      }else{

          return true;

      }

    }

     /*
    * Rotina 3
    * Ocorre a verificação do intervalo de tempo entre as datas
    * As datas retornadas do componente DateTimePicker do Material UI são formatadas
    * A formatação ocorre com a biblioteca Moment.js - https://momentjs.com/
    * 
    */ 
     function verifyDateInterval(){

      // Verificação da diferença das datas
      if(moment(startDate).format('YYYY-MM-DD hh:mm:ss') < moment(endDate).format('YYYY-MM-DD hh:mm:ss')){

        return true;
        
      }else{

        return false;

      }

    }

     /*
    * Rotina 4
    * Realização da requisição AXIOS
    * Possui dois casos: o Update e o Delete
    * 
    */ 
    function requestServerOperation(data){

      // Dados para o middleware de autenticação 
      let logged_user_id = AuthData.data.id;
      let module_id = 4;
      let module_action = "escrever";

      if(operation === "update"){

        AxiosApi.patch(`/api/reports-module/${data.get("id_input")}`, {
          auth: `${logged_user_id}.${module_id}.${module_action}`,
          flight_initial_date: moment(startDate).format('YYYY-MM-DD hh:mm:ss'),
          flight_final_date: moment(endDate).format('YYYY-MM-DD hh:mm:ss'),
          flight_log_file: data.get("flight_log"),
          observation: data.get("report_note")
        })
        .then(function (response) {
  
          successServerResponseTreatment();
  
        })
        .catch(function (error) {
          
          errorServerResponseTreatment(error.response.data);
  
        });

      }else if(operation === "delete"){

        AxiosApi.delete(`/api/reports-module/${data.get("id_input")}?auth=${logged_user_id}.${module_id}.${module_action}`)
        .then(function (response) {
  
          successServerResponseTreatment();
  
        })
        .catch(function (error) {
          
          errorServerResponseTreatment(error.response.data);
  
        });

      }

    }

    /*
    * Rotina 5A
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
    * Rotina 5B
    * Tratamento da resposta de uma requisição falha
    */
    function errorServerResponseTreatment(response_data){

      let error_message = (response_data.message != "" && response_data.message != undefined) ? response_data.message : "Houve um erro na realização da operação!";
      setDisplayAlert({display: true, type: "error", message: error_message});

      // Definição dos objetos de erro possíveis de serem retornados pelo validation do Laravel
      let input_errors = {
        flight_initial_date: {error: false, message: null},
        flight_final_date: {error: false, message: null},
        flight_log_file: {error: false, message: null},
        observation: {error: false, message: null},
      }

      // Coleta dos objetos de erro existentes na response
      for(let prop in response_data.errors){

        input_errors[prop] = {
          error: true, 
          message: response_data.errors[prop][0]
        }

      }

      setErrorDetected({
        flight_start_date: input_errors.flight_initial_date.error, 
        flight_end_date: input_errors.flight_final_date.error, 
        flight_log: input_errors.flight_log_file.error, 
        report_note: input_errors.observation.error
      });

      setErrorMessage({
        flight_start_date: input_errors.flight_initial_date.message, 
        flight_end_date: input_errors.flight_final_date.message, 
        flight_log: input_errors.flight_log_file.message, 
        report_note: input_errors.observation.message
      });

    }

    // ============================================================================== FUNÇÕES/ROTINAS DA PÁGINA ============================================================================== //

    // Se o perfil do usuário logado não tiver o poder de LER quanto ao módulo de "Administração", os botão serão desabilitados - porque o usuário não terá permissão para isso 
    // Ou, se o registro atual, da tabela, tiver um número de acesso menor (quanto menor, maior o poder) ou igual ao do usuário logado, os botão serão desabilitados - Super Admin não edita Super Admin, Admin não edita Admin, etc 
    const deleteButton = <IconButton 
    disabled={AuthData.data.user_powers["4"].profile_powers.escrever == 1 ? (data.access <= AuthData.data.general_access ? true : false) : true} 
    value = {data.id} onClick={handleClickOpen}
    ><DeleteIcon 
    style={{ fill: AuthData.data.user_powers["4"].profile_powers.escrever == 1 ? (data.access <= AuthData.data.general_access ? "#808991" : "#D4353B") : "#808991"}} 
    /></IconButton>

    const updateButton = <IconButton 
    disabled={AuthData.data.user_powers["4"].profile_powers.escrever == 1 ? false : true} 
    value = {data.id} onClick={handleClickOpen}
    ><EditIcon 
    style={{ fill: AuthData.data.user_powers["4"].profile_powers.escrever == 1 ? (data.access <= AuthData.data.general_access ? "#808991" : "#009BE5") : "#808991"}} 
    /></IconButton>

  return (
    <div>

      {/* Botão que abre o Modal - pode ser o de atualização ou de deleção, depende da operação */}
      {operation === "update" ? updateButton : deleteButton}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{operation === "update" ? "ATUALIZAÇÃO" : "DELEÇÃO"} | RELATÓRIO (ID: {data.report_id})</DialogTitle>

        {/* Formulário da criação/registro do usuário - Componente Box do tipo "form" */}
        <Box component="form" noValidate onSubmit={handleSubmitOperation} >

          <DialogContent>
            
            <TextField
              margin="dense"
              id="id_input"
              name="id_input"
              label="ID"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={data.report_id}
              InputProps={{
                  readOnly: true,
              }}
              disabled = {operation === "update" ? false : true}
            />
            
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
              <DateTimeInput 
                event = {setStartDate}
                label = {"Inicio do vôo"} 
                helperText = {errorMessage.flight_start_date} 
                error = {errorDetected.flight_start_date} 
                defaultValue = {data.flight_start_date}
                operation = {operation}
                />
                <DateTimeInput
                event = {setEndDate}
                label = {"Fim do vôo"} 
                helperText = {errorMessage.flight_end_date} 
                error = {errorDetected.flight_end_date} 
                defaultValue = {data.flight_end_date}
                operation = {operation}
              />
            </Box>

            <TextField
              margin="dense"
              id="flight_log"
              name="flight_log"
              label="Log do vôo"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={data.flight_log}
              InputProps={{
                  inputProps: { min: 0, max: 1 },
              }}
              helperText = {errorMessage.flight_log}
              error = {errorDetected.flight_log}
              disabled = {operation === "update" ? false : true}
            />

            <TextField
              margin="dense"
              id="report_note"
              name="report_note"
              label="Observação"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={data.report_note}
              disabled = {operation === "update" ? false : true}
              helperText = {errorMessage.report_note}
              error = {errorDetected.report_note}
            />

          </DialogContent>

          {displayAlert.display && 
              <Alert severity={displayAlert.type}>{displayAlert.message}</Alert> 
          }
          
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={disabledButton}>Confirmar {operation === "update" ? "atualização" : "deleção"}</Button>
          </DialogActions>

        </Box>

        
      </Dialog>
    </div>

  );

});