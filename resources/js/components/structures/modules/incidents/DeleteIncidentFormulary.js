// React
import * as React from 'react';
// Material UI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { Alert } from '@mui/material';
import { IconButton } from '@mui/material';
import { Tooltip } from "@mui/material";
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
// Custom
import { useAuthentication } from '../../../context/InternalRoutesAuth/AuthenticationContext';
import AxiosApi from '../../../../services/AxiosApi';

export function DeleteIncidentFormulary({ ...props }) {

  // ============================================================================== DECLARAÇÃO DOS STATES E OUTROS VALORES ============================================================================== //

  // Utilizador do state global de autenticação
  const { AuthData } = useAuthentication();

  // State da mensagem do alerta
  const [displayAlert, setDisplayAlert] = React.useState({ display: false, type: "", message: "" });

  // State da acessibilidade do botão de executar o registro
  const [disabledButton, setDisabledButton] = React.useState(false);

  // States do formulário
  const [open, setOpen] = React.useState(false);

  // ============================================================================== FUNÇÕES/ROTINAS DA PÁGINA ============================================================================== //

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setDisplayAlert({ display: false, type: "", message: "" });
    setDisabledButton(false);
    setOpen(false);
  }

  /*
 * Rotina 1
 * 
 */
  const handleSubmitOperation = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    setDisabledButton(true);

    requestServerOperation(data);

  }

  /*
 * Rotina 2
 * 
 */
  function requestServerOperation(data) {

    AxiosApi.delete(`/api/incidents-module/${data.get("id")}`)
      .then(function () {

        successServerResponseTreatment();

      })
      .catch(function (error) {

        errorServerResponseTreatment(error.response.data);

      });

  }

  /*
  * Rotina 3A
  */
  function successServerResponseTreatment() {

    setDisplayAlert({ display: true, type: "success", message: "Operação realizada com sucesso!" });

    setTimeout(() => {

      props.reload_table();
      setDisabledButton(false);
      handleClose();

    }, 2000);

  }

  /*
  * Rotina 3B
  */
  function errorServerResponseTreatment(response_data) {

    setDisabledButton(false);

    let error_message = (response_data.message != "" && response_data.message != undefined) ? response_data.message : "Houve um erro na realização da operação!";
    setDisplayAlert({ display: true, type: "error", message: error_message });

  }

  // ============================================================================== ESTRUTURAÇÃO DA PÁGINA - MATERIAL UI ============================================================================== //

  return (
    <>
      <Tooltip title="Deletar">
        <IconButton disabled={AuthData.data.user_powers["5"].profile_powers.read == 1 ? false : true} onClick={handleClickOpen}>
          <FontAwesomeIcon icon={faTrashCan} color={AuthData.data.user_powers["5"].profile_powers.read == 1 ? "#007937" : "#808991"} size="sm" />
        </IconButton>
      </Tooltip>

      {(props.record != null && open) &&

        <Dialog open={open} onClose={handleClose} PaperProps = {{style: { borderRadius: 15 }}}>
          <DialogTitle>DELEÇÃO | INCIDENTE (ID: {props.record.id})</DialogTitle>

          {/* Formulário da criação/registro do usuário - Componente Box do tipo "form" */}
          <Box component="form" noValidate onSubmit={handleSubmitOperation} >

            <DialogContent>

              <TextField
                type="text"
                margin="dense"
                label="ID do incidente"
                fullWidth
                variant="outlined"
                required
                id="id"
                name="id"
                InputProps={{
                  readOnly: true
                }}
                defaultValue={props.record.id}
                sx={{ mb: 2 }}
              />

              <TextField
                type="text"
                margin="dense"
                label="Tipo do incidente"
                fullWidth
                variant="outlined"
                required
                id="type"
                name="type"
                defaultValue={props.record.type}
                InputProps={{
                  readOnly: true
                }}
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
  )

}