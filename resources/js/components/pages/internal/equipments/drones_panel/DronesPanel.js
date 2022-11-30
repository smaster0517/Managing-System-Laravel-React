import * as React from 'react';
// Material UI
import { Tooltip, IconButton, Grid, TextField, InputAdornment, Box } from "@mui/material";
import { useSnackbar } from 'notistack';
import { DataGrid, ptBR } from '@mui/x-data-grid';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
// Custom
import { useAuthentication } from "../../../../context/InternalRoutesAuth/AuthenticationContext";
import axios from "../../../../../services/AxiosApi";
import { CreateDroneFormulary } from '../../../../structures/modules/equipment/drones/CreateDroneFormulary';
import { DeleteDroneFormulary } from '../../../../structures/modules/equipment/drones/DeleteDroneFormulary';
import { UpdateDroneFormulary } from '../../../../structures/modules/equipment/drones/UpdateDroneFormulary';
import { DroneInformation } from '../../../../structures/modules/equipment/drones/DroneInformation';
import { ExportTableData } from '../../../../structures/modals/dialog/ExportTableData';

const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'image',
        headerName: 'Image',
        width: 100,
        sortable: false,
        editable: false,
    },
    {
        field: 'name',
        headerName: 'Nome',
        flex: 1,
        sortable: true,
        editable: false,
    },
    {
        field: 'manufacturer',
        headerName: 'Fabricante',
        type: 'number',
        width: 150,
        headerAlign: 'left',
        sortable: true,
        editable: false
    },
    {
        field: 'model',
        headerName: 'Modelo',
        sortable: true,
        editable: false,
        flex: 1
    },
    {
        field: 'record_number',
        headerName: 'Nº registro',
        sortable: true,
        editable: false,
        width: 120,
    },
    {
        field: 'serial_number',
        headerName: 'Nº serial',
        sortable: true,
        editable: false,
        width: 120,
    },
    {
        field: 'weight',
        headerName: 'Peso',
        sortable: true,
        editable: false,
        width: 120,
    },
    {
        field: 'description',
        headerName: 'Descrição',
        sortable: true,
        editable: false,
        width: 120,
    },
];

export const DronesPanel = () => {

    // ============================================================================== STATES ============================================================================== //

    const { AuthData } = useAuthentication();

    const [records, setRecords] = React.useState([]);
    const [perPage, setPerPage] = React.useState(10);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalRecords, setTotalRecords] = React.useState(0);
    const [search, setSearch] = React.useState("0");
    const [selectedRecords, setSelectedRecords] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [reload, setReload] = React.useState(false);

    const { enqueueSnackbar } = useSnackbar();

    // ============================================================================== FUNCTIONS ============================================================================== //

    React.useEffect(() => {
        setLoading(true);
        setRecords([]);
        setSelectedRecords([]);
        fetchRecords();
    }, [reload]);

    function fetchRecords() {

        axios.get(`/api/equipments-module-drone?limit=${perPage}&search=${search}&page=${currentPage}`)
            .then(function (response) {
                setRecords(response.data.records);
                setTotalRecords(response.data.total_records);

                if (response.data.total_records > 1) {
                    handleOpenSnackbar(`Foram encontrados ${response.data.total_records} drones`, "success");
                } else {
                    handleOpenSnackbar(`Foi encontrado ${response.data.total_records} drone`, "success");
                }
            })
            .catch(function (error) {
                handleOpenSnackbar(error.response.data.message, "error");
            })
            .finally(() => {
                setLoading(false);
            })
    }

    function handleChangePage(newPage) {
        // If actual page is bigger than the new one, is a reduction of actual
        // If actual is smaller, the page is increasing
        setCurrentPage((current) => {
            return current > newPage ? (current - 1) : newPage;
        });
        setReload((old) => !old);
    }

    function handleChangeRowsPerPage(newValue) {
        setPerPage(newValue);
        setCurrentPage(1);
        setReload((old) => !old);
    }

    function handleSelection(newSelectedIds) {
        // newSelectedIds always bring all selections
        const newSelectedRecords = records.filter((record) => {
            if (newSelectedIds.includes(record.id)) {
                return record;
            }
        })
        setSelectedRecords(newSelectedRecords);
    }

    function handleOpenSnackbar(text, variant) {
        enqueueSnackbar(text, { variant });
    }

    // ============================================================================== STRUCTURES ============================================================================== //

    return (
        <>
            <Grid container spacing={1} alignItems="center" mb={1}>

                <Grid item>
                    {selectedRecords.length > 0 &&
                        <IconButton disabled={!AuthData.data.user_powers["6"].profile_powers.write == 1}>
                            <FontAwesomeIcon icon={faPlus} color={"#E0E0E0"} size="sm" />
                        </IconButton>
                    }

                    {selectedRecords.length === 0 &&
                        <CreateDroneFormulary reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0 || selectedRecords.length > 1) &&
                        <Tooltip title="Selecione um registro">
                            <IconButton disabled={!AuthData.data.user_powers["6"].profile_powers.write == 1}>
                                <FontAwesomeIcon icon={faPen} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {(!loading && selectedRecords.length === 1) &&
                        <UpdateDroneFormulary record={selectedRecords[0]} reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0) &&
                        <Tooltip title="Selecione um registro">
                            <IconButton disabled={!AuthData.data.user_powers["6"].profile_powers.write == 1} >
                                <FontAwesomeIcon icon={faTrashCan} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {(!loading && selectedRecords.length > 0) &&
                        <DeleteDroneFormulary records={selectedRecords} reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0 || selectedRecords.length > 1) &&
                        <IconButton disabled={!AuthData.data.user_powers["6"].profile_powers.write == 1} >
                            <FontAwesomeIcon icon={faCircleInfo} color="#E0E0E0" size="sm" />
                        </IconButton>
                    }

                    {(selectedRecords.length === 1) &&
                        <DroneInformation record={selectedRecords[0]} />
                    }
                </Grid>

                <Grid item>
                    {AuthData.data.user_powers["6"].profile_powers.read == 1 &&
                        <ExportTableData type="DRONES" source={"/api/drones/export"} />
                    }

                    {!AuthData.data.user_powers["6"].profile_powers.read == 1 &&
                        <IconButton disabled>
                            <FontAwesomeIcon icon={faFileCsv} color="#E0E0E0" size="sm" />
                        </IconButton>
                    }
                </Grid>

                <Grid item>
                    <Tooltip title="Carregar">
                        <IconButton onClick={() => setReload((old) => !old)}>
                            <FontAwesomeIcon icon={faArrowsRotate} size="sm" id="reload_icon" color='#007937' />
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Grid item xs>
                    <TextField
                        fullWidth
                        placeholder={"Pesquisar um incidente por ID"}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") setReload((old) => !old) }}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start">
                                    <IconButton onClick={() => setReload((old) => !old)}>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
                                    </IconButton>
                                </InputAdornment>,
                            disableunderline: 1,
                            sx: { fontSize: 'default' }
                        }}
                        variant="outlined"
                    />
                </Grid>

            </Grid>

            <Box
                sx={{ height: 500, width: '100%' }}
            >
                <DataGrid
                    rows={records}
                    columns={columns}
                    pageSize={perPage}
                    loading={loading}
                    page={currentPage - 1}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    checkboxSelection
                    disableSelectionOnClick
                    paginationMode='server'
                    experimentalFeatures={{ newEditingApi: true }}
                    onPageSizeChange={(newPageSize) => handleChangeRowsPerPage(newPageSize)}
                    onSelectionModelChange={handleSelection}
                    onPageChange={(newPage) => handleChangePage(newPage + 1)}
                    rowCount={totalRecords}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                    sx={{
                        "&.MuiDataGrid-root .MuiDataGrid-cell, .MuiDataGrid-columnHeader:focus-within": {
                            outline: "none !important",
                        },
                        '& .super-app-theme--header': {
                            color: '#222'
                        }
                    }}
                />
            </Box>
        </>
    )
}