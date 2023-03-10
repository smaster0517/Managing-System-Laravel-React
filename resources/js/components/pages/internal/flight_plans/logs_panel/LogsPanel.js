import * as React from 'react';
// Material UI
import { Tooltip, IconButton, Grid, TextField, InputAdornment, Box, Chip } from "@mui/material";
import { DataGrid, ptBR } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faFile } from '@fortawesome/free-solid-svg-icons';
// Custom
import { ModalImage } from '../../../../shared/modals/dialog/ModalImage';
import axios from "../../../../../services/AxiosApi";
import { CreateLog } from './formulary/CreateLog';
import { UpdateLog } from './formulary/UpdateLog';
import { DeleteLog } from './formulary/DeleteLog';
import { useAuth } from '../../../../context/Auth';
import { ExportTableData } from '../../../../shared/modals/dialog/ExportTableData';
import { TableToolbar } from '../../../../shared/table_toolbar/TableToolbar';

const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'name',
        headerName: 'Nome',
        flex: 1,
        minWidth: 200,
        sortable: true,
        editable: false
    },
    {
        field: 'filename',
        headerName: 'Arquivo',
        sortable: true,
        editable: false,
        flex: 1,
        minWidth: 150
    },
    {
        field: 'service_order',
        headerName: 'Ordem de serviço',
        sortable: true,
        editable: false,
        minWidth: 250,
        renderCell: (data) => {

            function chipStyle(related_service_order) {
                if (related_service_order === null) {
                    return { label: "Nenhuma", disabled: true, variant: "outlined" };
                } else if (related_service_order != null) {
                    return { label: related_service_order.number, color: related_service_order.deleted == 1 ? "error" : "success", variant: related_service_order.deleted == 1 ? "contained" : "outlined" };
                }
            }

            const chip_style = chipStyle(data.row.service_order);

            return (
                <Chip {...chip_style} />
            )
        },
    },
    {
        field: 'log_image',
        headerName: 'Ver imagem',
        sortable: false,
        editable: false,
        minWidth: 130,
        renderCell: (data) => {
            return <ModalImage image_url={data.row.image_url} />
        }
    },
    {
        field: 'export_txt',
        headerName: 'Exportar KML',
        sortable: false,
        editable: false,
        width: 150,
        align: 'center',
        renderCell: (data) => {

            const { enqueueSnackbar } = useSnackbar();

            function handleDownloadLog(filename) {
                axios.get(`api/logs-module-download/${filename}`, null, {
                    responseType: 'blob'
                })
                    .then(function (response) {
                        enqueueSnackbar(`Download realizado com sucesso! Arquivo: ${filename}`, { variant: "success" });

                        // Download forçado do arquivo com o conteúdo retornado do servidor
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${filename}`); //or any other extension
                        document.body.appendChild(link);
                        link.click();

                    })
                    .catch(() => {
                        enqueueSnackbar(`O download não foi realizado! Arquivo: ${filename}`, { variant: "error" });
                    })
            }

            return (
                <IconButton onClick={() => handleDownloadLog(data.row.filename)}>
                    <FontAwesomeIcon icon={faFile} color={"#00713A"} size="sm" />
                </IconButton>
            )
        }
    },
]

export const LogsPanel = () => {

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

    function fetchRecords() {

        axios.get(`/api/plans-module-logs?limit=${perPage}&search=${search}&page=${currentPage}`)
            .then((response) => {
                setRecords(response.data.records);
                setTotalRecords(response.data.total_records);

                if (response.data.total_records > 1) {
                    handleOpenSnackbar(`Foram encontrados ${response.data.total_records} logs`, "success");
                } else {
                    handleOpenSnackbar(`Foi encontrado ${response.data.total_records} log`, "success");
                }
            })
            .catch((error) => {
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
                        <IconButton>
                            <FontAwesomeIcon icon={faPlus} color={"#E0E0E0"} size="sm" />
                        </IconButton>
                    }

                    {selectedRecords.length === 0 &&
                        <CreateLog reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {(selectedRecords.length === 0 || selectedRecords.length > 1) &&
                        <Tooltip title="Selecione um registro">
                            <IconButton>
                                <FontAwesomeIcon icon={faPen} color={"#E0E0E0"} size="sm" />
                            </IconButton>
                        </Tooltip>
                    }

                    {(!loading && selectedRecords.length === 1) &&
                        <UpdateLog record={selectedRecords[0]} reloadTable={setReload} />
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
                        <DeleteLog records={selectedRecords} reloadTable={setReload} />
                    }
                </Grid>

                <Grid item>
                    {user.user_powers["2"].profile_powers.read == 1 &&
                        <ExportTableData type="LOGS" source={"/api/logs/export"} />
                    }

                    {!user.user_powers["2"].profile_powers.read == 1 &&
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
                        placeholder={"Pesquisar plano por ID ou nome"}
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
    );
}