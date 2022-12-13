import * as React from 'react';
// Material UI
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, IconButton, Alert, LinearProgress, Divider, Grid } from '@mui/material';
// Custom
import { useAuthentication } from '../../../../../context/InternalRoutesAuth/AuthenticationContext';
import { FormValidation } from '../../../../../../utils/FormValidation';
import { SelectAttributeControl } from '../../../../../shared/input_select/SelectAttributeControl';
import axios from '../../../../../../services/AxiosApi';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

const initialFieldError = { name: false, email: false, profile: false };
const initialFieldErrorMessage = { name: "", email: "", profile: "" };
const initialDisplayAlert = { display: false, type: "", message: "" };

export const UpdateUser = React.memo((props) => {

  // ============================================================================== STATES ============================================================================== //

  const { AuthData } = useAuthentication();

  const [controlledInput, setControlledInput] = React.useState({ id: props.record.id, name: props.record.name, email: props.record.email, profile: props.record.profile.id });
  const [fieldError, setFieldError] = React.useState(initialFieldError);
  const [fieldErrorMessage, setFieldErrorMessage] = React.useState(initialFieldErrorMessage);
  const [displayAlert, setDisplayAlert] = React.useState(initialDisplayAlert);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // ============================================================================== FUNCTIONS ============================================================================== //

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setFieldError(initialFieldError);
    setFieldErrorMessage(initialFieldErrorMessage);
    setDisplayAlert(initialDisplayAlert);
    setLoading(false);
    setOpen(false);
  }

  function handleSubmit() {
    if (formValidation()) {
      setLoading(true);
      requestServer();
    }
  }

  function formValidation() {
    const emailValidate = FormValidation(controlledInput.email, null, null, /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "e-mail");
    const nameValidate = FormValidation(controlledInput.name, 3, null, null, null);
    const profileValidate = Number(controlledInput.profile) === 0 ? { error: true, message: "Selecione um perfil" } : { error: false, message: "" };

    setFieldError({ email: emailValidate.error, name: nameValidate.error, profile: profileValidate.error });
    setFieldErrorMessage({ email: emailValidate.message, name: nameValidate.message, profile: profileValidate.message });

    return !(emailValidate.error === true || nameValidate.error === true || profileValidate.error);
  }

  function requestServer() {
    axios.patch(`/api/admin-module-user/${controlledInput.id}`, {
      name: controlledInput.name,
      email: controlledInput.email,
      status: controlledInput.status,
      profile_id: controlledInput.profile
    })
      .then((response) => {
        successResponse(response);
      })
      .catch((error) => {
        errorResponse(error.response);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  function successResponse(response) {
    setDisplayAlert({ display: true, type: "success", message: response.data.message });
    setTimeout(() => {
      props.reloadTable((old) => !old);
      setLoading(false);
      handleClose();
    }, 2000);
  }

  function errorResponse(response) {
    setDisplayAlert({ display: true, type: "error", message: response.data.message });

    let request_errors = {
      email: { error: false, message: null },
      name: { error: false, message: null },
      profile_id: { error: false, message: null }
    }

    for (let prop in response.data.errors) {
      request_errors[prop] = {
        error: true,
        message: response.data.errors[prop][0]
      }
    }

    setFieldError({
      email: request_errors.email.error,
      name: request_errors.name.error,
      profile: request_errors.profile_id.error
    });

    setFieldErrorMessage({
      email: request_errors.email.message,
      name: request_errors.name.message,
      profile: request_errors.profile_id.message
    });
  }

  function handleInputChange(event) {
    setControlledInput({ ...controlledInput, [event.target.name]: event.currentTarget.value });
  }

  // ============================================================================== STRUCTURES ============================================================================== //

  return (
    <>
      <Tooltip title="Editar">
        <IconButton disabled={!AuthData.data.user_powers["1"].profile_powers.write == 1} onClick={handleClickOpen}>
          <FontAwesomeIcon icon={faPen} color={AuthData.data.user_powers["1"].profile_powers.write == 1 ? "#007937" : "#E0E0E0"} size="sm" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { borderRadius: 15 } }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>ATUALIZAÇÃO DE USUÁRIO</DialogTitle>
        <Divider />

        <DialogContent>

          <Grid container columns={12} spacing={1}>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="id"
                label="ID"
                type="email"
                fullWidth
                variant="outlined"
                value={controlledInput.id}
                inputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="name"
                label="Nome completo"
                fullWidth
                variant="outlined"
                onChange={handleInputChange}
                value={controlledInput.name}
                helperText={fieldErrorMessage.name}
                error={fieldError.name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Endereço de email"
                type="email"
                fullWidth
                variant="outlined"
                onChange={handleInputChange}
                defaultValue={props.record.email}
                helperText={fieldErrorMessage.email}
                error={fieldError.email}
              />
            </Grid>

            <Grid item xs={6}>
              <SelectAttributeControl
                label_text={"Perfil"}
                data_source={"/api/load-profiles"}
                primary_key={"id"}
                key_content={"name"}
                name={"profile"}
                onChange={handleInputChange}
                error={fieldError.profile}
                value={controlledInput.profile}
                setControlledInput={setControlledInput}
                controlledInput={controlledInput}
              />
            </Grid>

          </Grid>

        </DialogContent>

        {displayAlert.display &&
          <Alert severity={displayAlert.type}>{displayAlert.message}</Alert>
        }

        {loading && <LinearProgress />}

        <Divider />
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" disabled={loading} variant="contained" onClick={handleSubmit}>Confirmar</Button>
        </DialogActions>

      </Dialog>
    </>
  );
});