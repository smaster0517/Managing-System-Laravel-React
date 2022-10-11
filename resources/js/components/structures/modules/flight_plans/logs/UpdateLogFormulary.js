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
import { Tooltip } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import FormHelperText from '@mui/material/FormHelperText';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
// Custom
import { useAuthentication } from '../../../../context/InternalRoutesAuth/AuthenticationContext';
import { FormValidation } from '../../../../../utils/FormValidation';
import AxiosApi from '../../../../../services/AxiosApi';
import { GenericSelect } from '../../../input_select/GenericSelect';

export const UpdateLogFormulary = React.memo((props) => {

    // ============================================================================== STATES ============================================================================== //

    const { AuthData } = useAuthentication();
    const [open, setOpen] = React.useState(false);
    const [controlledInput, setControlledInput] = React.useState({ id: props.record.id, name: props.record.name, flight_plan_id: props.record.flight_plan != null ? props.record.flight_plan.id : "0" });
    const [fieldError, setFieldError] = React.useState({ name: false, flight_plan_id: false });
    const [fieldErrorMessage, setFieldErrorMessage] = React.useState({ name: "", flight_plan_id: "" });
    const [displayAlert, setDisplayAlert] = React.useState({ display: false, type: "", message: "" });
    const [loading, setLoading] = React.useState(false);

    // ============================================================================== FUNCTIONS ============================================================================== //

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setFieldError({ name: false });
        setFieldErrorMessage({ name: "" });
        setDisplayAlert({ display: false, type: "", message: "" });
        setOpen(false);
        setLoading(false);
    };

    const handleSubmitOperation = (event) => {
        event.preventDefault();

        if (submitedDataValidate()) {

            setLoading(true);
            requestServerOperation();

        }

    }

    const submitedDataValidate = () => {

        const nameValidate = FormValidation(controlledInput.name, 3, null, null, null);

        setFieldError({ name: nameValidate.error, flight_plan_id: false });
        setFieldErrorMessage({ name: nameValidate.message });

        return !nameValidate.error;

    }

    const requestServerOperation = () => {

        const data = {
            id: controlledInput.id,
            name: controlledInput.name,
            flight_plan_id: controlledInput.flight_plan_id === "0" ? null : controlledInput.flight_plan_id
        }

        AxiosApi.patch(`/api/plans-module-logs/${controlledInput.id}`, data)
            .then(function () {

                setLoading(false);
                successServerResponseTreatment();

            })
            .catch(function (error) {

                setLoading(false);
                errorServerResponseTreatment(error.response.data);

            });

    }

    const successServerResponseTreatment = () => {

        setDisplayAlert({ display: true, type: "success", message: "Operação realizada com sucesso!" });

        setTimeout(() => {

            props.record_setter(null);
            props.reload_table();
            setLoading(false);
            handleClose();

        }, 2000);

    }

    const errorServerResponseTreatment = (response_data) => {

        let error_message = response_data.message ? response_data.message : "Erro do servidor!";
        setDisplayAlert({ display: true, type: "error", message: error_message });

        // Definição dos objetos de erro possíveis de serem retornados pelo validation do Laravel
        let input_errors = {
            name: { error: false, message: null },
            flight_plan_id: { error: false, message: null }
        }

        // Coleta dos objetos de erro existentes na response
        for (let prop in response_data.errors) {

            input_errors[prop] = {
                error: true,
                message: response_data.errors[prop][0]
            }

        }

        setFieldError({
            name: input_errors.name.error,
            flight_plan_id: input_errors.flight_plan_id.error
        });

        setFieldErrorMessage({
            name: input_errors.name.message,
            flight_plan_id: input_errors.flight_plan_id.message
        });

    }

    const handleInputChange = (event) => {
        setControlledInput({ ...controlledInput, [event.target.name]: event.currentTarget.value });
    }

    // ============================================================================== STRUCTURES - MUI ============================================================================== //

    return (
        <>

            <Tooltip title="Editar">
                <IconButton disabled={AuthData.data.user_powers["4"].profile_powers.write == 1 ? false : true} onClick={handleClickOpen}>
                    <FontAwesomeIcon icon={faPen} color={AuthData.data.user_powers["4"].profile_powers.write == 1 ? "#007937" : "#808991"} size="sm" />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} PaperProps={{ style: { borderRadius: 15 } }} fullWidth>
                <DialogTitle>ATUALIZAÇÃO | RELATÓRIO (ID: {props.record.report_id})</DialogTitle>

                <Box component="form" noValidate onSubmit={handleSubmitOperation} >

                    <DialogContent>

                        <Box sx={{ mb: 2 }}>
                            <TextField
                                margin="dense"
                                id="id"
                                name="id"
                                label="ID"
                                type="text"
                                fullWidth
                                variant="outlined"
                                defaultValue={props.record.id}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <TextField
                                margin="dense"
                                label="Nome customizado"
                                type="text"
                                fullWidth
                                name="name"
                                variant="outlined"
                                value={controlledInput.name}
                                onChange={handleInputChange}
                                helperText={fieldErrorMessage.name}
                                error={fieldError.name}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <GenericSelect
                                label_text="Planos de voo"
                                data_source={"/api/load-flight-plans"}
                                primary_key={"id"}
                                key_content={"name"}
                                setControlledInput={setControlledInput}
                                controlledInput={controlledInput}
                                error={fieldError.flight_plan_id}
                                name={"flight_plan_id"}
                                value={controlledInput.flight_plan_id}
                            />
                            <FormHelperText>{fieldErrorMessage.flight_plan_id}</FormHelperText>
                        </Box>

                    </DialogContent>

                    {displayAlert.display &&
                        <Alert severity={displayAlert.type}>{displayAlert.message}</Alert>
                    }

                    {loading && <LinearProgress />}

                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading} variant="contained">Confirmar</Button>
                    </DialogActions>

                </Box>

            </Dialog>

        </>

    );

});