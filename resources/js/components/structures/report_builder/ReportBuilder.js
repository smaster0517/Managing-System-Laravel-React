import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import VisibilityIcon from '@mui/icons-material/Visibility';
// Assets
import BirdviewLogo from "../../assets/images/Logos/Birdview.png";
// Libs
import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { style } from '@mui/system';
import moment from 'moment/moment';

// Create styles
const styles = StyleSheet.create({
    viewer: {
        width: "100%",
        height: "650px"
    },
    page: {
        display: 'flex',
        flexDirection: 'column',
        padding: 50,
    },
    section: {
        width: '100%',
        marginBottom: '20px'
    },
    table_section: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '20px',
        padding: 0
    },
    table_row: {
        display: 'flex',
        flexDirection: 'row',
        height: '20px'
    },
    table_head: {
        border: '1px solid #000',
        padding: '4px',
        fontSize: '10px',
        flexShrink: 0,
        flexGrow: 0,
        fontWeight: 'bold',
        backgroundColor: '#A0A0A0'
    },
    table_data: {
        border: '1px solid #000',
        padding: '3px',
        fontSize: '10px',
        flexShrink: 0,
        flexGrow: 0
    },
    top_legends: {
        padding: '5px 5px 5px 0',
        fontSize: '12px',
        fontWeight: '900'
    },
    logo: {
        width: '90px',
        height: '40px',
        marginBottom: '20px'
    },
});

export const ReportBuilder = React.memo((props) => {

    const [open, setOpen] = React.useState(false);

    const [report, setReport] = React.useState({});

    const handleClickOpen = () => {
        setOpen(true);
        setReport(props.data);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (

        <>
            <Button variant="contained" onClick={handleClickOpen} startIcon={<VisibilityIcon />}>Visualizar</Button>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullScreen
            >
                <DialogTitle id="alert-dialog-title">
                    {"Visualização do relatório"}
                </DialogTitle>
                <DialogContent>

                    <PDFViewer style={styles.viewer}>
                        <Document>
                            <Page size="A4" style={styles.page}>
                                <>
                                    <View style={styles.section}>
                                        <Image
                                            src={BirdviewLogo}
                                            style={styles.logo}
                                        ></Image>
                                        <Text style={styles.top_legends}>{`RELATÓRIO: ${report.name}`.toUpperCase()}</Text>
                                        <Text style={styles.top_legends}>{`CLIENTE: ${report.client}`.toUpperCase()}</Text>
                                        <Text style={styles.top_legends}>{`REGIÃO: ${report.city}, ${report.state}`.toUpperCase()}</Text>
                                        <Text style={styles.top_legends}>{`FAZENDA: ${report.farm}`.toUpperCase()}</Text>
                                    </View>

                                    <View style={styles.table_section}>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_head, flexBasis: '160px' }}>{"ÁREA TOTAL APLICADA (ha)"}</Text>
                                            <Text style={{ ...styles.table_head, flexBasis: '130px', textAlign: 'center' }}>{"DATA DA APLICAÇÃO"}</Text>
                                            <Text style={{ ...styles.table_head, flexBasis: '115px', textAlign: 'center' }}>{"Nº DA APLICAÇÃO"}</Text>
                                            <Text style={{ ...styles.table_head, flexBasis: '100px', textAlign: 'center' }}>{"DOSAGEM/Ha"}</Text>
                                        </View>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_data, flexBasis: '160px', textAlign: 'center' }}>{report.area}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '130px', textAlign: 'center' }}>{moment(report.date).format('DD/MM/YYYY')}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '115px', textAlign: 'center' }}>{report.number}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '100px', textAlign: 'center' }}>{report.dosage}</Text>
                                        </View>
                                    </View>


                                    <View style={styles.table_section}>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_head, flexBasis: '200px', textAlign: 'center' }}>{"CONDIÇÕES CLIMÁTICAS"}</Text>
                                            <Text style={{ ...styles.table_head, flexBasis: '155px', textAlign: 'center' }}>{"INICIAL"}</Text>
                                            <Text style={{ ...styles.table_head, flexBasis: '155px', textAlign: 'center' }}>{"FINAL"}</Text>
                                        </View>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_data, flexBasis: '200px', textAlign: 'center' }}>{"TEMPERATURA (Cº)"}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '155px', textAlign: 'center' }}>{report.temperature}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '155px', textAlign: 'center' }}>{report.temperature}</Text>
                                        </View>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_data, flexBasis: '200px', textAlign: 'center' }}>{"UMIDADE"}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '155px', textAlign: 'center' }}>{report.humidity}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '155px', textAlign: 'center' }}>{report.humidity}</Text>
                                        </View>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_data, flexBasis: '200px', textAlign: 'center' }}>{"VENTO (Km/h)"}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '155px', textAlign: 'center' }}>{report.wind}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '155px', textAlign: 'center' }}>{report.wind}</Text>
                                        </View>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_data, flexBasis: '200px', textAlign: 'center' }}>{"FORNECEDOR"}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '310px', textAlign: 'center' }}>{report.provider}</Text>
                                        </View>
                                        <View style={styles.table_row}>
                                            <Text style={{ ...styles.table_data, flexBasis: '200px', textAlign: 'center' }}>{"RESPONSÁVEL"}</Text>
                                            <Text style={{ ...styles.table_data, flexBasis: '310px', textAlign: 'center' }}>{report.provider}</Text>
                                        </View>
                                    </View>

                                </>
                            </Page>
                        </Document>
                    </PDFViewer>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained">Fechar</Button>
                </DialogActions>
            </Dialog>
        </>

    );
});