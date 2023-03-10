import * as React from 'react';
// Material UI
import { Tooltip, IconButton, Grid, TextField, InputAdornment, Box } from "@mui/material";
import { useSnackbar } from 'notistack';
import { DataGrid, ptBR } from '@mui/x-data-grid';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
// Custom
import { CreateReport } from './formulary/CreateReport';
import { UpdateReport } from './formulary/UpdateReport';
import { DeleteReport } from './formulary/DeleteReport';
import { useAuth } from '../../../../context/Auth';
import { ExportTableData } from '../../../../shared/modals/dialog/ExportTableData';
import { TableToolbar } from '../../../../shared/table_toolbar/TableToolbar';
import axios from "../../../../../services/AxiosApi";

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
    field: 'service_order',
    headerName: 'Ordem de serviço',
    flex: 1,
    minWidth: 150,
    sortable: true,
    editable: false,
    valueGetter: (data) => {
      return data.row.service_order.number
    }
  },
  {
    field: 'observation',
    headerName: 'Observação',
    sortable: true,
    editable: false,
    flex: 1,
    minWidth: 200
  },
  {
    field: 'created_at',
    headerName: 'Criado em',
    sortable: true,
    editable: false,
    minWidth: 130
  },
  {
    field: 'export',
    headerName: 'Exportar',
    sortable: true,
    editable: false,
    minWidth: 150,
    renderCell: (data) => {

      const { enqueueSnackbar } = useSnackbar();

      function handleDownloadReport(report) {

        axios.get(`/api/reports-module-download/${report.file}?report_id=${report.id}`,
          {
            headers: {
              'Content-type': 'application/json'
            },
            responseType: 'blob'
          })
          .then(function (response) {
            enqueueSnackbar(`Download realizado com sucesso! Arquivo: ${report.file}`, { variant: "success" });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${report.file}`); //or any other extension
            document.body.appendChild(link);
            link.click();

          })
          .catch(function () {
            enqueueSnackbar(`O download não foi realizado! Arquivo: ${report.file}`, { variant: "error" });
          });
      }

      return (
        <Tooltip title={"Download"}>
          <IconButton onClick={() => handleDownloadReport(data.row)}>
            <FontAwesomeIcon icon={faFilePdf} size="sm" color={"#007937"} />
          </IconButton>
        </Tooltip>
      )
    }
  }
];

export function ReportsPanel() {

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

    axios.get(`/api/reports-module?limit=${perPage}&search=${search}&page=${currentPage}`)
      .then(function (response) {
        setRecords(response.data.records);
        setTotalRecords(response.data.total_records);

        if (response.data.total_records > 1) {
          handleOpenSnackbar(`Foram encontrados ${response.data.total_records} relatórios`, "success");
        } else {
          handleOpenSnackbar(`Foi encontrado ${response.data.total_records} relatório`, "success");
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
            <IconButton>
              <FontAwesomeIcon icon={faPlus} color={"#E0E0E0"} size="sm" />
            </IconButton>
          }

          {selectedRecords.length === 0 &&
            <CreateReport reloadTable={setReload} />
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
            <UpdateReport record={selectedRecords[0]} reloadTable={setReload} />
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
            <DeleteReport records={selectedRecords} reloadTable={setReload} />
          }
        </Grid>

        <Grid item>
          {user.user_powers["4"].profile_powers.read == 1 &&
            <ExportTableData type="RELATÓRIOS" source={"/api/reports/export"} />
          }

          {!user.user_powers["4"].profile_powers.read == 1 &&
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
  );
}