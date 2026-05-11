import React from 'react';
import { Modal, Backdrop, Fade, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImagePreviewModal = ({ open, onClose, imageUrl }) => {
    return (
        <Modal open={open} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
            <Fade in={open}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '90vw', maxHeight: '90vh', outline: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton onClick={onClose} sx={{ position: 'absolute', top: -40, right: 0, color: 'white' }}><CloseIcon /></IconButton>
                    <Box component="img" src={imageUrl} alt="Full Preview" sx={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 1, boxShadow: 24 }} />
                </Box>
            </Fade>
        </Modal>
    );
};

export default ImagePreviewModal;
