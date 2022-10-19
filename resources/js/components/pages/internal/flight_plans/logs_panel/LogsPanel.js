// React
import * as React from 'react';
// Custom
import AxiosApi from "../../../../../services/AxiosApi";
import { CreateLogFormulary } from '../../../../structures/modules/flight_plans/logs/CreateLogFormulary';
import { UpdateLogFormulary } from '../../../../structures/modules/flight_plans/logs/UpdateLogFormulary';
import { DeleteLogFormulary } from '../../../../structures/modules/flight_plans/logs/DeleteLogFormulary';
import { useAuthentication } from '../../../../context/InternalRoutesAuth/AuthenticationContext';
import LinearProgress from '@mui/material/LinearProgress';
// Material UI
import { Table } from "@mui/material";
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import { InputAdornment } from "@mui/material";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { Link } from "@mui/material";
import { useSnackbar } from 'notistack';
import AssignmentIcon from '@mui/icons-material/Assignment';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
// Lib
import moment from 'moment';

const StyledHeadTableCell = styled(TableCell)({
    color: '#fff',
    fontWeight: 700
});

export const LogsPanel = () => {

    // ============================================================================== DECLARAÇÃO DOS STATES E OUTROS VALORES ============================================================================== //

    const { AuthData } = useAuthentication();

    const [records, setRecords] = React.useState([]);
    const [pagination, setPagination] = React.useState({ total_records: 0, records_per_page: 0, total_pages: 0 });
    const [paginationConfig, setPaginationConfig] = React.useState({ page: 1, limit: 10, order_by: "id", search: 0, total_records: 0, filter: 0 });
    const [loading, setLoading] = React.useState(true);
    const [selectedRecordIndex, setSelectedRecordIndex] = React.useState(null);
    const [searchField, setSearchField] = React.useState("");

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    // Context do snackbar
    const { enqueueSnackbar } = useSnackbar();

    // ============================================================================== FUNÇÕES/ROTINAS DA PÁGINA ============================================================================== //

    React.useEffect(() => {
        serverLoadRecords();
    }, [paginationConfig]);

    const serverLoadRecords = () => {

        const limit = paginationConfig.limit;
        const search = paginationConfig.search;
        const page = paginationConfig.page;
        const order_by = paginationConfig.order_by;
        const filter = paginationConfig.filter;

        AxiosApi.get(`/api/plans-module-logs?limit=${limit}&search=${search}&page=${page}&order_by=${order_by}&filter=${filter}`)
            .then((response) => {

                setLoading(false);
                setRecords(response.data.records);
                setPagination({ total_records: response.data.total_records, records_per_page: response.data.records_per_page, total_pages: response.data.total_pages });

                if (response.data.total_records > 1) {
                    handleOpenSnackbar(`Foram encontrados ${response.data.total_records} logs`, "success");
                } else {
                    handleOpenSnackbar(`Foi encontrado ${response.data.total_records} log`, "success");
                }

            })
            .catch((error) => {

                const error_message = error.response.data.message ? error.response.data.message : "Erro do servidor";
                handleOpenSnackbar(error_message, "error");

                setLoading(false);
                setRecords([]);
                setPagination({ total_records: 0, records_per_page: 0, total_pages: 0 });

            });

    }

    const handleTablePageChange = (event, value) => {

        setPaginationConfig({
            page: value + 1,
            limit: paginationConfig.limit,
            order_by: "id",
            search: paginationConfig.search,
            total_records: 0,
            filter: 0
        });

    };

    const handleChangeRowsPerPage = (event) => {

        setPaginationConfig({
            page: 1,
            limit: event.target.value,
            order_by: "id",
            search: paginationConfig.search,
            total_records: 0,
            filter: 0
        });

    };

    function handleSearchSubmit(event) {
        event.preventDefault();

        setPaginationConfig({
            page: 1,
            limit: paginationConfig.limit,
            order_by: "id",
            search: searchField,
            total_records: 0,
            filter: 0
        });

    }

    const reloadTable = () => {

        setSelectedRecordIndex(null);

        setLoading(true);
        setRecords([]);
        setPagination({
            total_records: 0,
            records_per_page: 0,
            total_pages: 0
        });

        setPaginationConfig({
            page: 1,
            limit: paginationConfig.limit,
            order_by: "id",
            search: 0,
            total_records: 0,
            filter: 0
        });

    }

    const handleClickRadio = (event) => {

        const value = event.target.value;

        if (value === selectedRecordIndex) {
            setSelectedRecordIndex(null);
        } else if (value != selectedRecordIndex) {
            setSelectedRecordIndex(event.target.value);
        }

    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleOpenSnackbar = (text, variant) => {
        enqueueSnackbar(text, { variant });
    }

    // ============================================================================== ESTRUTURAÇÃO DA PÁGINA - COMPONENTES DO MATERIAL UI ============================================================================== //

    return (
        <>
            <Grid container spacing={1} alignItems="center" mb={1}>

                <Grid item>
                    {selectedRecordIndex &&
                        <IconButton disabled={AuthData.data.user_powers["2"].profile_powers.write == 1 ? false : true}>
                            <FontAwesomeIcon icon={faPlus} color={"#E0E0E0"} size="sm" />
                        </IconButton>
                    }

                    {selectedRecordIndex === null &&
                        <CreateLogFormulary reload_table={reloadTable} />
                    }
                </Grid>

                <Grid item>
                    {selectedRecordIndex === null &&
                        <Tooltip title="Selecione um registro">
                            <IconButton disabled={AuthData.data.user_powers["2"].profile_powers.write == 1 ? false : true}>
                                <FontAwesomeIcon icon={faPen} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {(!loading && selectedRecordIndex != null) &&
                        <UpdateLogFormulary record={records[selectedRecordIndex]} record_setter={setSelectedRecordIndex} reload_table={reloadTable} />
                    }
                </Grid>

                <Grid item>
                    {selectedRecordIndex === null &&
                        <Tooltip title="Selecione um registro">
                            <IconButton disabled={AuthData.data.user_powers["2"].profile_powers.write == 1 ? false : true} >
                                <FontAwesomeIcon icon={faTrashCan} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {/* O modal é renderizado apenas quando um registro já foi selecionado */}
                    {(!loading && selectedRecordIndex != null) &&
                        <DeleteLogFormulary record={records[selectedRecordIndex]} record_setter={setSelectedRecordIndex} reload_table={reloadTable} />
                    }
                </Grid>

                <Grid item>
                    <IconButton disabled={AuthData.data.user_powers["2"].profile_powers.write == 1 ? false : true} >
                        <FontAwesomeIcon icon={faCircleInfo} color={"#E0E0E0"} size="sm" />
                    </IconButton>
                </Grid>

                <Grid item>
                    <Tooltip title="Filtros">
                        <IconButton
                            disabled={AuthData.data.user_powers["2"].profile_powers.write == 1 ? false : true}
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <FontAwesomeIcon icon={faFilter} color={AuthData.data.user_powers["2"].profile_powers.write == 1 ? "#007937" : "#808991"} size="sm" />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem ><Checkbox /> Ativos </MenuItem>
                    <MenuItem ><Checkbox /> Desabilitados </MenuItem>
                </Menu>

                <Grid item>
                    <Tooltip title="Carregar">
                        <IconButton onClick={reloadTable}>
                            <FontAwesomeIcon icon={faArrowsRotate} size="sm" id="reload_icon" color='#007937' />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item xs>
                    <TextField
                        fullWidth
                        placeholder={"Pesquisar plano por id e nome"}
                        onChange={(e) => setSearchField(e.currentTarget.value)}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start">
                                    <IconButton onClick={handleSearchSubmit}>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
                                    </IconButton>
                                </InputAdornment>,
                            disableunderline: 1,
                            sx: { fontSize: 'default' },
                            disableUnderline: true
                        }}
                        variant="outlined"
                    />
                </Grid>

                {(!loading && records.length > 0) &&
                    <Grid item>
                        <Stack spacing={2}>
                            <TablePagination
                                labelRowsPerPage="Linhas por página: "
                                component="div"
                                count={pagination.total_records}
                                page={paginationConfig.page - 1}
                                onPageChange={handleTablePageChange}
                                rowsPerPage={paginationConfig.limit}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Stack>
                    </Grid>
                }

            </Grid>

            <FormControl fullWidth>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                    value={selectedRecordIndex}
                >
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 500 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledHeadTableCell>ID</StyledHeadTableCell>
                                    <StyledHeadTableCell align="center">Nome</StyledHeadTableCell>
                                    <StyledHeadTableCell align="center">Nome do arquivo</StyledHeadTableCell>
                                    <StyledHeadTableCell align="center">Data</StyledHeadTableCell>
                                    <StyledHeadTableCell align="center">Plano de voo</StyledHeadTableCell>
                                    <StyledHeadTableCell align="center">Ordem de serviço</StyledHeadTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="tbody">
                                {(!loading && records.length > 0) &&
                                    records.map((log, index) => (
                                        <TableRow key={log.id}>
                                            <TableCell><FormControlLabel value={index} control={<Radio onClick={(e) => { handleClickRadio(e) }} />} label={log.id} /></TableCell>
                                            <TableCell align="center">{log.name}</TableCell>
                                            <TableCell align="center">{log.filename}</TableCell>
                                            <TableCell align="center">{moment(log.timestamp).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell align="center">
                                                {log.flight_plan ?
                                                    <Link href={`/internal/map?file=${log.flight_plan.path}`} target="_blank">
                                                        <Tooltip title="Ver plano">
                                                            <IconButton disabled={!AuthData.data.user_powers["2"].profile_powers.read == 1}>
                                                                <FontAwesomeIcon icon={faEye} color={AuthData.data.user_powers["2"].profile_powers.read == 1 ? "#00713A" : "#E0E0E0"} size="sm" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Link>
                                                    :
                                                    <Tooltip title={"Nenhum plano de voo vinculado"}>
                                                        <IconButton disabled={!AuthData.data.user_powers["2"].profile_powers.read == 1}>
                                                            <FontAwesomeIcon icon={faEye} color={"#E0E0E0"} size="sm" />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                            <TableCell align="center">
                                                {log.service_order ?
                                                    <Tooltip title={log.service_order.number}>
                                                        <IconButton disabled={!AuthData.data.user_powers["2"].profile_powers.read == 1}>
                                                            <AssignmentIcon style={{ color: "#00713A" }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    :
                                                    <Tooltip title={"Nenhuma ordem de serviço vinculada"}>
                                                        <IconButton disabled={!AuthData.data.user_powers["2"].profile_powers.read == 1}>
                                                            <AssignmentIcon color="disabled" />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>

                    </TableContainer>

                </RadioGroup>
            </FormControl>
            {loading && <LinearProgress color="success" />}
        </>
    );
}