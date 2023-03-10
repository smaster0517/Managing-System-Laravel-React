import * as React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Divider } from '@mui/material';

const imageStyle = {
    width: '90%',
    height: '90%',
    cursor: 'pointer'
}

export function ModalImage(props) {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <>
            <img src={props.image_url} style={imageStyle} onClick={handleClickOpen} />
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <img src={props.image_url} width={"100%"} height={"100%"} />
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={handleClose} variant="contained">Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}