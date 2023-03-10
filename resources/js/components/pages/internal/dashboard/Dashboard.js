import React from 'react';
// Material UI
import { Paper, Grid, Card, Typography, LinearProgress, Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import GroupIcon from '@mui/icons-material/Group';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
// Custom
import axios from '../../../../services/AxiosApi';
import { usePage } from '../../../context/PageContext.js';
import { VerticalLinesChart } from '../../../shared/charts/VerticalLinesChart';

const miniCardStyle = {
    bgcolor: '#fff',
    minWidth: 150,
    minHeight: 110,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 0
}

const miniCardTopStyle = {
    flexBasis: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: 1
};

const biggerCardStyle = {
    bgcolor: '#fff',
    padding: 2,
    minHeight: 280,
    display: 'flex',
    flexDirection: 'column'
}

const paperStyle = {
    width: "100%",
    mb: 1,
    backgroundColor: 'transparent',
    boxShadow: 0
}

export const Dashboard = React.memo(() => {

    // ============================================================================== STATES ============================================================================== //

    const [loading, setLoading] = React.useState(true);
    const [users, setUsers] = React.useState(null);
    const [profiles, setProfiles] = React.useState(null);
    const [flightPlans, setFlightPlans] = React.useState(null);
    const [serviceOrders, setServiceOrders] = React.useState(null);
    const [reports, setReports] = React.useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const { setPageIndex } = usePage();

    // ============================================================================== FUNCTIONS ============================================================================== //

    React.useEffect(() => {

        let is_mounted = true;
        setPageIndex(0);

        const fetch = async () => {

            try {

                const response = await axios.get("/api/load-dashboard-metrics");

                if (is_mounted) {
                    setUsers(response.data.users);
                    setProfiles(response.data.profiles);
                    setFlightPlans(response.data.flight_plans);
                    setServiceOrders(response.data.service_orders);
                    setReports(response.data.reports);
                    enqueueSnackbar("M??tricas carregadas", { variant: "success" });
                }

            } catch (error) {
                const error_message = error.response.data.message ? error.response.data.message : "Erro do servidor";
                enqueueSnackbar(error_message, { variant: "error" });
            } finally {
                setLoading(false);
            }

        }

        fetch();

        return () => {
            return is_mounted = false;
        }

    }, []);

    // =============================================================== JSX  =============================================================== //

    return (
        <>
            <Paper sx={paperStyle}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 0, sm: 1, md: 1 }} columns={{ xs: 10, sm: 10, md: 12, lg: 10, xl: 10 }}>
                    <Grid item xs={10} sm={5} md={4} lg={2}>
                        <Card sx={miniCardStyle}>
                            <Box sx={miniCardTopStyle}>
                                <Typography variant="h6">
                                    Usu??rios
                                </Typography>
                                <Typography variant="p" color="green" sx={{ display: "flex", alignItems: 'center' }}>
                                    <GroupIcon sx={{ mr: 1 }} /> {users ? users.total : 0}
                                </Typography>
                            </Box>
                            <Box sx={{ height: 110, width: '100%' }}>
                                {loading && !users && <LinearProgress />}
                                {!loading && users && <VerticalLinesChart data={users} />}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={10} sm={5} md={4} lg={2}>
                        <Card sx={miniCardStyle}>
                            <Box sx={miniCardTopStyle}>
                                <Typography variant="h6">
                                    Perfis
                                </Typography>
                                <Typography variant="p" color="green" sx={{ display: "flex", alignItems: 'center' }}>
                                    <AssignmentIndIcon sx={{ mr: 1 }} /> {profiles ? profiles.total : 0}
                                </Typography>
                            </Box>
                            <Box sx={{ height: 110, width: '100%' }}>
                                {loading && !profiles && <LinearProgress />}
                                {!loading && profiles && <VerticalLinesChart data={profiles} />}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={10} sm={5} md={4} lg={2}>
                        <Card sx={miniCardStyle}>
                            <Box sx={miniCardTopStyle}>
                                <Typography variant="h6">
                                    Planos de voo
                                </Typography>
                                <Typography variant="p" color="green" sx={{ display: "flex", alignItems: 'center' }}>
                                    <MapIcon sx={{ mr: 1 }} /> {flightPlans ? flightPlans.total : 0}
                                </Typography>
                            </Box>
                            <Box sx={{ height: 110, width: '100%' }}>
                                {loading && !flightPlans && <LinearProgress />}
                                {!loading && flightPlans && <VerticalLinesChart data={flightPlans} />}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={10} sm={5} md={4} lg={2}>
                        <Card sx={miniCardStyle}>
                            <Box sx={miniCardTopStyle}>
                                <Typography variant="h6">
                                    Ordens de servi??o
                                </Typography>
                                <Typography variant="p" color="green" sx={{ display: "flex", alignItems: 'center' }}>
                                    <AssignmentIcon sx={{ mr: 1 }} /> {serviceOrders ? serviceOrders.total : 0}
                                </Typography>
                            </Box>
                            <Box sx={{ height: 110, width: '100%' }}>
                                {loading && !serviceOrders && <LinearProgress />}
                                {!loading && serviceOrders && <VerticalLinesChart data={serviceOrders} />}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={10} sm={5} md={4} lg={2}>
                        <Card sx={miniCardStyle}>
                            <Box sx={miniCardTopStyle}>
                                <Typography variant="h6">
                                    Relat??rios
                                </Typography>
                                <Typography variant="p" color="green" sx={{ display: "flex", alignItems: 'center' }}>
                                    <AssessmentIcon sx={{ mr: 1 }} /> {reports ? reports.total : 0}
                                </Typography>
                            </Box>
                            <Box sx={{ height: 110, width: '100%' }}>
                                {loading && !reports && <LinearProgress />}
                                {!loading && reports && <VerticalLinesChart data={reports} />}
                            </Box>
                        </Card>
                    </Grid>
                </Grid >
            </Paper >

            <Paper sx={paperStyle}>
                <Grid container rowSpacing={1} columnSpacing={1} columns={12}>
                    <Grid item xs={12}>
                        <Card sx={biggerCardStyle}>
                            <Box sx={{ flexBasis: '30px' }}>
                                <Typography variant="h6">
                                    Tr??fego anual
                                </Typography>
                            </Box>
                            <Box sx={{ height: 250, width: '100%', mt: 2 }}>
                                Chart
                            </Box>
                        </Card>
                    </Grid>
                </Grid >
            </Paper>
        </>
    )
});