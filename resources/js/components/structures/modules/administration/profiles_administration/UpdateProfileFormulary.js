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
import { Grid } from '@mui/material';
import { FormLabel } from '@mui/material';
import { Checkbox } from '@mui/material';
import { FormGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';

// IMPORTAÇÃO DOS COMPONENTES CUSTOMIZADOS
import { FormValidation } from '../../../../../utils/FormValidation';
import { useAuthentication } from '../../../../context/InternalRoutesAuth/AuthenticationContext';
import AxiosApi from '../../../../../services/AxiosApi';

// IMPORTAÇÃO DOS ÍCONES DO FONTS AWESOME
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

export const UpdateProfileFormulary = React.memo(({...props}) => {

// ============================================================================== DECLARAÇÃO DOS STATES E OUTROS VALORES ============================================================================== //

    // Utilizador do state global de autenticação
    const {AuthData, setAuthData} = useAuthentication();

    // States do formulário
    const [open, setOpen] = React.useState(false);

    // States utilizados nas validações dos campos 
    const [errorDetected, setErrorDetected] = useState({profile_name: false}); // State para o efeito de erro - true ou false
    const [errorMessage, setErrorMessage] = useState({profile_name: null}); // State para a mensagem do erro - objeto com mensagens para cada campo

    // State da mensagem do alerta
    const [displayAlert, setDisplayAlert] = useState({display: false, type: "", message: ""});

    // State da acessibilidade do botão de executar o registro
    const [disabledButton, setDisabledButton] = useState(false);

    const [modulePowers, setModulePowers] = useState({
      "1": {read: false, write: false}, 
      "2": {read: false, write: false}, 
      "3": {read: false, write: false}, 
      "4": {read: false, write: false},
      "5": {read: false, write: false}
      }
    );

// ============================================================================== FUNÇÕES/ROTINAS DA PÁGINA ============================================================================== //
    
    // Função para abrir o modal
    const handleClickOpen = () => {
        if(props.selected_record.dom != null){
            setOpen(true);
        }
    };

    // Função para fechar o modal
    const handleClose = () => {

      setErrorDetected({profile_name: false});
      setErrorMessage({profile_name: null});
      setDisplayAlert({display: false, type: "", message: ""});
      setDisabledButton(false);

      setOpen(false);

    };

    /*
    * Rotina 1
    * Ponto inicial do processamento do envio do formulário de atualização ou deleção
    */
    function handleSubmitOperation(event){
        event.preventDefault();

        // Instância da classe JS FormData - para trabalhar os dados do formulário
        const data = new FormData(event.currentTarget);

        setDisabledButton(true);

        // Validação dos dados do formulário
        // A comunicação com o backend só é realizada se o retorno for true
        if(dataValidate(data)){

            // Inicialização da requisição para o servidor
            requestServerOperation(data);

        }

    }

    /*
    * Rotina 2
    * Validação dos dados no frontend
    */
    function dataValidate(formData){

      const nameValidate = FormValidation(formData.get("profile_name"), 3, null, null, null);

      setErrorDetected({profile_name: nameValidate.error});
      setErrorMessage({profile_name: nameValidate.message});

      if(nameValidate.error === true){

          return false;

      }else{

          return true;

      }

    }

    /*
    * Rotina 3
    * Comunicação AJAX com o Laravel utilizando AXIOS
    */
    function requestServerOperation(data){

        // Dados para o middleware de autenticação
        let logged_user_id = AuthData.data.id; 
        let module_id = 1; 
        let action = "escrever"; 

        AxiosApi.patch(`/api/admin-module-profile/${data.get("profile_id")}`, {
            auth: `${logged_user_id}.${module_id}.${action}`,
            profile_name: data.get("profile_name"),
            profile_modules_relationship: modulePowers
        })
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

      setDisabledButton(false);

      let error_message = (response_data.message != "" && response_data.message != undefined) ? response_data.message : "Houve um erro na realização da operação!";
      setDisplayAlert({display: true, type: "error", message: error_message});

      // Definição dos objetos de erro possíveis de serem retornados pelo validation do Laravel
      let input_errors = {
        profile_name: {error: false, message: null}
      }

      // Coleta dos objetos de erro existentes na response
      for(let prop in response_data.errors){

        input_errors[prop] = {
          error: true, 
          message: response_data.errors[prop][0]
        }

      }

      setErrorDetected({profile_name: input_errors.profile_name.error});
      setErrorMessage({profile_name: input_errors.profile_name.message});

    }

    /*
    * Essa função serve para organizar os valores dos checkbox
    * 
    */
    function changeModulePowers(event, module_and_power){

      // O retorno será um array com os valores [id_modulo, poder]
      let checkboxIdentifiers = module_and_power.split("|");
      let checkboxModule = checkboxIdentifiers[0];
      let checkboxPower = checkboxIdentifiers[1];

      // Um checkbox é alterado por vez
      // Cada checkbox é de um módulo, e de um poder desse módulo
      // O checkbox não alterado recebe o seu valor atual
      // O checkbox alterado recebe sempre o valor new_value

      let new_value = event.currentTarget.checked;

        // Se for o checkbox do módulo 1...
        if(checkboxModule === "1"){

            // Se for o poder "read"...
            if(checkboxPower === "read"){

            setModulePowers({
                "1": {read: new_value, write: modulePowers["1"].write}, 
                "2": {read: modulePowers["2"].read, write: modulePowers["2"].write}, 
                "3": {read: modulePowers["3"].read, write: modulePowers["3"].write}, 
                "4":{read: modulePowers["4"].read, write: modulePowers["4"].write},
                "5":{read: modulePowers["5"].read, write: modulePowers["5"].write}
                }
            );

            }else if(checkboxPower === "write"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: new_value}, 
                "2": {read: modulePowers["2"].read, write: modulePowers["2"].write}, 
                "3": {read: modulePowers["3"].read, write: modulePowers["3"].write}, 
                "4":{read: modulePowers["4"].read, write: modulePowers["4"].write},
                "5":{read: modulePowers["5"].read, write: modulePowers["5"].write}
                }
            );

            }

        }else if(checkboxModule === "2"){

            if(checkboxPower === "read"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: modulePowers["1"].write}, 
                "2": {read: new_value, write: modulePowers["2"].write}, 
                "3": {read: modulePowers["3"].read, write: modulePowers["3"].write}, 
                "4":{read: modulePowers["4"].read, write: modulePowers["4"].write},
                "5":{read: modulePowers["5"].read, write: modulePowers["5"].write}
                }
            );

            }else if(checkboxPower === "write"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: modulePowers["1"].write}, 
                "2": {read: modulePowers["2"].read, write: new_value}, 
                "3": {read: modulePowers["3"].read, write: modulePowers["3"].write}, 
                "4":{read: modulePowers["4"].read, write: modulePowers["3"].write},
                "5":{read: modulePowers["5"].read, write: modulePowers["5"].write}
                }
            );
            
            }

        }else if(checkboxModule === "3"){

            if(checkboxPower === "read"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: modulePowers["1"].write}, 
                "2": {read: modulePowers["2"].read, write: modulePowers["2"].write}, 
                "3": {read: new_value, write: modulePowers["3"].write}, 
                "4":{read: modulePowers["4"].read, write: modulePowers["4"].write},
                "5":{read: modulePowers["5"].read, write: modulePowers["5"].write}
                }
            );

            }else if(checkboxPower === "write"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: modulePowers["1"].write}, 
                "2": {read: modulePowers["2"].read, write: modulePowers["2"].write}, 
                "3": {read: modulePowers["3"].read, write: new_value}, 
                "4":{read: modulePowers["4"].read, write: modulePowers["4"].write},
                "5":{read: modulePowers["5"].read, write: modulePowers["5"].write}
                }
            );
            
            }

        }else if(checkboxModule === "4"){

            if(checkboxPower === "read"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: modulePowers["1"].write}, 
                "2": {read: modulePowers["2"].read, write: modulePowers["2"].write}, 
                "3": {read: modulePowers["3"].read, write: modulePowers["3"].write}, 
                "4":{read: new_value, write: modulePowers["4"].write},
                "5":{read: new_value, write: modulePowers["5"].write}
                }
            );

            }else if(checkboxPower === "write"){

            setModulePowers({
                "1": {read: modulePowers["1"].read, write: modulePowers["1"].write}, 
                "2": {read: modulePowers["2"].read, write: modulePowers["2"].write}, 
                "3": {read: modulePowers["3"].read, write: modulePowers["3"].write}, 
                "4":{read: modulePowers["4"].read, write: new_value},
                "5":{read: modulePowers["5"].read, write: new_value}
                }
            );
            
            }

        }

    }

// ============================================================================== ESTRUTURAÇÃO DA PÁGINA - COMPONENTES DO MATERIAL UI ============================================================================== //
    
      return (
        <>
            <Tooltip title="Editar">
                <IconButton disabled={AuthData.data.user_powers["2"].profile_powers.ler == 1 ? false : true} onClick={handleClickOpen}>
                    <FontAwesomeIcon icon={faPenToSquare} color={AuthData.data.user_powers["2"].profile_powers.ler == 1 ? "green" : "#808991"} size = "sm"/>
                </IconButton>
            </Tooltip>
    
            {(props.selected_record.dom != null && open) && 
    
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>EDIÇÃO | PLANO DE VÔO (ID: {props.selected_record.data_cells.profile_id})</DialogTitle>

                    <Box component="form" noValidate onSubmit={handleSubmitOperation} >

                        <DialogContent>
                
                            <TextField
                            margin="dense"
                            defaultValue={props.selected_record.data_cells.profile_id}
                            id="profile_id"
                            name = "profile_id"
                            label="ID do perfil"
                            fullWidth
                            variant="outlined"
                            sx={{mb: 2}}
                            />

                            <TextField
                            margin="dense"
                            defaultValue={props.selected_record.data_cells.profile_name}
                            id="profile_name"
                            name = "profile_name"
                            label="Nome do perfil"
                            fullWidth
                            variant="outlined"
                            helperText = {errorMessage.profile_name}
                            error = {errorDetected.profile_name}
                            />

                        </DialogContent>

                         {/* Os checkbox não possuem name porque seus valores, após o envio do formulário, serão recuperados a partir do state "modulePowers" */}

                        
                        <Grid container sx={{ ml: 2, mb: 3 }} spacing={1} alignItems="left">

                            <Grid item>
                                <FormLabel component="legend">Admin</FormLabel>
                                <FormGroup>
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["1"].profile_powers.ler == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "1|read")} } />} label="Ler" />
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["1"].profile_powers.escrever == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "1|write")} } />} label="Escrever" />
                                </FormGroup>
                            </Grid>

                            <Grid item>
                                <FormLabel component="legend">Planos</FormLabel>
                                <FormGroup>
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["2"].profile_powers.ler == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "2|read")} } />} label="Ler" />
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["2"].profile_powers.escrever == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "2|write")} } />} label="Escrever" />
                                </FormGroup>
                            </Grid>

                            <Grid item>
                                <FormLabel component="legend">Ordens</FormLabel>
                                <FormGroup>
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["3"].profile_powers.ler == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "3|read") }} />} label="Ler" />
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["3"].profile_powers.escrever == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "3|write") }} />} label="Escrever" />
                                </FormGroup>
                            </Grid>

                            <Grid item>
                                <FormLabel component="legend">Relatórios</FormLabel>
                                <FormGroup>
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["4"].profile_powers.ler == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "4|read") }} />} label="Ler" />
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["4"].profile_powers.escrever == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "4|write") }} />} label="Escrever" />
                                </FormGroup>
                            </Grid>

                            <Grid item>
                                <FormLabel component="legend">Incidentes</FormLabel>
                                <FormGroup>
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["5"].profile_powers.ler == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "5|read") }} />} label="Ler" />
                                <FormControlLabel control={<Checkbox defaultChecked={props.selected_record.data_cells.modules["5"].profile_powers.escrever == 1 ? true : false} onChange={(event) => { changeModulePowers(event, "5|write") }} />} label="Escrever" />
                                </FormGroup>
                            </Grid>

                        </Grid>
          
                        {displayAlert.display && 
                            <Alert severity={displayAlert.type}>{displayAlert.message}</Alert> 
                        }
            
                        <DialogActions>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button type="submit" disabled={disabledButton} variant="contained">Confirmar atualização</Button>
                        </DialogActions>

                    </Box>
    
                </Dialog>
            }
        </>
    );
});