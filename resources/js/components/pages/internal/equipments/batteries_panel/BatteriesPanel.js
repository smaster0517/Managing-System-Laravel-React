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
import { ModalImage } from '../../../../shared/modals/dialog/ModalImage';
import { CreateBattery } from './formulary/CreateBattery';
import { UpdateBattery } from './formulary/UpdateBattery';
import { DeleteBattery } from './formulary/DeleteBattery';
import { BatteryInformation } from './formulary/BatteryInformation';
import { ExportTableData } from '../../../../shared/modals/dialog/ExportTableData';
import { TableToolbar } from '../../../../shared/table_toolbar/TableToolbar';
import { useAuth } from '../../../../context/Auth';
import axios from "../../../../../services/AxiosApi";
// Moment
import moment from 'moment';

const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'image',
        headerName: 'Image',
        width: 100,
        sortable: false,
        editable: false,
        renderCell: (data) => {
            return <ModalImage image_url={data.row.image_url} />
        }
    },
    {
        field: 'name',
        headerName: 'Nome',
        flex: 1,
        minWidth: 200,
        sortable: true,
        editable: false,
    },
    {
        field: 'manufacturer',
        headerName: 'Fabricante',
        type: 'number',
        flex: 1,
        minWidth: 200,
        headerAlign: 'left',
        sortable: true,
        editable: false
    },
    {
        field: 'model',
        headerName: 'Modelo',
        sortable: true,
        editable: false,
        flex: 1,
        minWidth: 150
    },
    {
        field: 'serial_number',
        headerName: 'N?? serial',
        sortable: true,
        editable: false,
        flex: 1,
        minWidth: 150
    },
    {
        field: 'last_charge',
        headerName: 'Carga',
        sortable: true,
        editable: false,
        width: 120,
        valueGetter: (data) => {
            return data.row.last_charge != "nunca" ? moment(data.row.last_charge).format("DD/MM/YYYY") : data.row.last_charge
        }
    },
    {
        field: 'observation',
        headerName: 'Observa????o',
        sortable: true,
        editable: false,
        flex: 1,
        minWidth: 200,
        valueGetter: () => {
            return 'Nenhuma'
        }
    },
];

export function BatteriesPanel() {

    // ============================================================================== STATES ============================================================================== //

    const { user } = useAuth();

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

    async function fetchRecords() {

        try {

            const response = await axios.get(`/api/equipments-module-battery?limit=${perPage}&search=${search}&page=${currentPage}`);

            setRecords(response.data.records);
            setTotalRecords(response.data.total_records);

            enqueueSnackbar(`Baterias encontradas: ${response.data.total_records}`, { variant: "success" });

        } catch (error) {
            enqueueSnackbar(error.response.data.message, { variant: "error" });
        } finally {
            setLoading(false);
        }

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

    // ============================================================================== STRUCTURES ============================================================================== //

    return (
        <>
            <Grid container spacing={1} alignItems="center" mb={1}>

                <Grid item>
                    {selectedRecords.length > 0 &&
                        <IconButton>
                            <FontAwesomeIcon icon={faPlus} color={"#E0E0E0"} size="sm" />
                        </IconButton>
                    }

                    {selectedRecords.length === 0 &&
                        <CreateBattery reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0 || selectedRecords.length > 1) &&
                        <Tooltip title="Selecione um registror">
                            <IconButton>
                                <FontAwesomeIcon icon={faPen} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {(!loading && selectedRecords.length === 1) &&
                        <UpdateBattery record={selectedRecords[0]} reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0) &&
                        <Tooltip title="Selecione um registro">
                            <IconButton>
                                <FontAwesomeIcon icon={faTrashCan} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {(!loading && selectedRecords.length > 0) &&
                        <DeleteBattery records={selectedRecords} reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0 || selectedRecords.length > 1) &&
                        <IconButton>
                            <FontAwesomeIcon icon={faCircleInfo} color="#E0E0E0" size="sm" />
                        </IconButton>
                    }

                    {(selectedRecords.length === 1) &&
                        <BatteryInformation record={selectedRecords[0]} />
                    }
                </Grid>

                <Grid item>
                    {user.user_powers["6"].profile_powers.read == 1 &&
                        <ExportTableData type="BATERIAS" source={"/api/batteries/export"} />
                    }

                    {!user.user_powers["6"].profile_powers.read == 1 &&
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

                <Grid item xs={12}>
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
                    rowHeight={70}
                    checkboxSelection
                    disableSelectionOnClick
                    paginationMode='server'
                    experimentalFeatures={{ newEditingApi: true }}
                    onPageSizeChange={(newPageSize) => handleChangeRowsPerPage(newPageSize)}
                    onSelectionModelChange={handleSelection}
                    onPageChange={(newPage) => handleChangePage(newPage + 1)}
                    rowCount={totalRecords}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                    components={{
                        Toolbar: TableToolbar,
                    }}
                    sx={{
                        "&.MuiDataGrid-root .MuiDataGrid-cell, .MuiDataGrid-columnHeader:focus-within": {
                            outline: "none !important",
                        },
                        '& .super-app-theme--header': {
                            color: '#222'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px'
                        }
                    }}
                />
            </Box>
        </>
    )
}