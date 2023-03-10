import * as React from 'react';
// Material UI
import { Link, Tooltip, IconButton, Grid, TextField, InputAdornment, Box } from "@mui/material";
import { DataGrid, ptBR } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
// Fonts Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { faFileLines } from '@fortawesome/free-solid-svg-icons';
// Custom
import { UpdateFlightPlan } from './formulary/UpdateFlightPlan';
import { DeleteFlightPlan } from './formulary/DeleteFlightPlan';
import { FlightPlanInformation } from './formulary/FlightPlanInformation';
import { ModalImage } from '../../../../shared/modals/dialog/ModalImage';
import { useAuth } from '../../../../context/Auth';
import { ExportTableData } from '../../../../shared/modals/dialog/ExportTableData';
import { TableToolbar } from '../../../../shared/table_toolbar/TableToolbar';
import axios from "../../../../../services/AxiosApi";
// Moment
import moment from 'moment';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'image',
    headerName: 'Ver plano',
    width: 130,
    sortable: false,
    editable: false,
    renderCell: (data) => {
      return (
        <ModalImage image_url={data.row.image_url} />
      )
    }
  },
  {
    field: 'name',
    headerName: 'Nome',
    flex: 1,
    minWidth: 200,
    sortable: true,
    editable: false
  },
  {
    field: 'creator',
    headerName: 'Criador',
    sortable: true,
    editable: false,
    flex: 1,
    minWidth: 200,
    valueGetter: (data) => {
      return data.row.creator.name;
    },
  },
  {
    field: 'created_at',
    headerName: 'Criado em',
    type: 'number',
    headerAlign: 'left',
    align: 'center',
    sortable: true,
    editable: false,
    width: 130,
    valueGetter: (data) => {
      return moment(data.row.created_at).format("DD/MM/YYYY")
    }
  },
  {
    field: 'service_orders',
    headerName: 'Ordens de servi??o',
    width: 160,
    align: 'center',
    sortable: true,
    editable: false,
    valueGetter: (data) => {
      return data.row.service_orders.data.length;
    }
  },
  {
    field: 'logs',
    headerName: 'Logs',
    sortable: true,
    editable: false,
    width: 120,
    align: 'center',
    valueGetter: (data) => {
      return data.row.logs.length;
    }
  },
  {
    field: 'incidents',
    headerName: 'Incidentes',
    sortable: true,
    editable: false,
    width: 150,
    align: 'center',
    valueGetter: (data) => {
      return data.row.total_incidents;
    }
  },
  {
    field: 'open',
    headerName: 'Abrir',
    width: 150,
    sortable: false,
    align: 'center',
    renderCell: (data) => {
      return (
        <IconButton>
          <Link href={`/internal/map?file=${data.row.file}`} target="_blank">
            <FontAwesomeIcon icon={faMap} color={"#00713A"} size="sm" />
          </Link>
        </IconButton>
      )
    }
  },
  {
    field: 'export_txt',
    headerName: 'Exportar TXT',
    sortable: false,
    editable: false,
    width: 150,
    align: 'center',
    renderCell: (data) => {

      const { enqueueSnackbar } = useSnackbar();

      function handleDownloadFlightPlan(filename) {
        axios.get(`/api/plans-module-download/${filename}`, null, {
          responseType: 'blob'
        })
          .then(function (response) {
            enqueueSnackbar(`Download realizado com sucesso! Arquivo: ${filename}`, { variant: "success" });

            // Download for??ado do arquivo com o conte??do retornado do servidor
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}`); //or any other extension
            document.body.appendChild(link);
            link.click();

          })
          .catch(() => {
            enqueueSnackbar(`O download n??o foi realizado! Arquivo: ${filename}`, { variant: "error" });
          })
      }

      return (
        <IconButton onClick={() => handleDownloadFlightPlan(data.row.file)}>
          <FontAwesomeIcon icon={faFileLines} color={"#00713A"} size="sm" />
        </IconButton>
      )
    }
  },
  {
    field: 'export_csv',
    headerName: 'Exportar CSV',
    sortable: false,
    editable: false,
    width: 150,
    align: 'center',
    renderCell: (data) => {

      const { enqueueSnackbar } = useSnackbar();

      function handleDownloadFlightPlanAsCSV(filename) {
        axios.get(`/api/plans-module-download/${filename}`, null, {
          responseType: 'blob'
        })
          .then(function (response) {
            enqueueSnackbar(`Download realizado com sucesso! Arquivo: ${filename}`, { variant: "success" });

            // ========= Routine that already exists in the map algorithm ========= //
            let content = "latitude;longitude;altitude(m)\n";

            // Create array from file lines
            var lines = response.data.split("\n");

            // Breaking lines where exists spaces (\t)
            for (let i = 4; i < lines.length - 2; i++) {
              let line = lines[i].split("\t");

              // Only waypoints with latitude and longitude are considered - code 16
              // Code 183 waypoints (dispenser trigger) have lat/long reset and cannot be added to route drawing
              if (Number(line[3]) == 16) {

                // Latitude, longitude, and altitude positions are at indices 8, 9, and 10 of each row
                content += line[8] + ";" + line[9] + ";" + line[10] + "\n";
              }
            }

            //console.log(content);

            let blob = new Blob([content],
              { type: "text/plain;charset=utf-8" });

            // Nome do arquivo com data em milissegundos decorridos
            let filename = new Date().getTime() + ".csv";

            // Download for??ado
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}`); //or any other extension
            document.body.appendChild(link);
            link.click();

          })
          .catch(() => {
            enqueueSnackbar(`O download n??o foi realizado! Arquivo: ${filename}`, { variant: "error" });
          })
      }

      return (
        <IconButton onClick={() => handleDownloadFlightPlanAsCSV(data.row.file)}>
          <FontAwesomeIcon icon={faFileCsv} color={"#00713A"} size="sm" />
        </IconButton>
      )
    }
  },
];

export function FlightPlansPanel() {

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

    let is_mounted = true;
    if (!is_mounted) return '';

    setLoading(true);
    setRecords([]);
    setSelectedRecords([]);
    fetchRecords();

    return () => {
      is_mounted = false;
    }

  }, [reload]);

  function fetchRecords() {

    axios.get(`/api/plans-module?limit=${perPage}&search=${search}&page=${currentPage}`)
      .then(function (response) {
        setRecords(response.data.records);
        setTotalRecords(response.data.total_records);

        if (response.data.total_records > 1) {
          handleOpenSnackbar(`Foram encontrados ${response.data.total_records} planos de voo`, "success");
        } else {
          handleOpenSnackbar(`Foi encontrado ${response.data.total_records} plano de voo`, "success");
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
            /* <CreateFlightPlan reloadTable={setReload} /> */
            <Tooltip title="Novo Plano">
              <Link href={`/internal/map?userid=${user.id}`} target="_blank">
                <IconButton>
                  <FontAwesomeIcon icon={faPlus} color={user.user_powers["2"].profile_powers.write == 1 ? "#00713A" : "#E0E0E0"} size="sm" />
                </IconButton>
              </Link>
            </Tooltip>
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
            <UpdateFlightPlan record={selectedRecords[0]} reloadTable={setReload} />
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
            <DeleteFlightPlan records={selectedRecords} reloadTable={setReload} />
          }
        </Grid>

        <Grid item>
          {(selectedRecords.length === 0 || selectedRecords.length > 1) &&
            <IconButton>
              <FontAwesomeIcon icon={faCircleInfo} color="#E0E0E0" size="sm" />
            </IconButton>
          }

          {(selectedRecords.length === 1) &&
            <FlightPlanInformation record={selectedRecords[0]} />
          }
        </Grid>

        <Grid item>
          {user.user_powers["2"].profile_powers.read == 1 &&
            <ExportTableData type="PLANOS DE VOO" source={"/api/flight-plans/export"} />
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
            placeholder={"Pesquisar plano por id e nome"}
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