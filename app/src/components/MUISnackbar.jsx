// components/MUISnackbar.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { closeSnackbar } from '../redux/slices/snackbar';

const MUISnackbar = () => {
  const dispatch = useDispatch();
  const { open, message, severity, duration } = useSelector((state) => state.snackbar);

  const handleClose = () => {
    dispatch(closeSnackbar());
  };

return (
    <Snackbar
        open={open ?? false}
        autoHideDuration={duration ?? 3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
        <Alert
            onClose={handleClose}
            severity={severity ?? 'info'}
            sx={{
                width: '100%',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                backgroundColor: severity === 'success' ? '#4caf50' : severity === 'error' ? '#f44336' : severity === 'warning' ? '#ff9800' : '#2196f3',
                color: '#fff',
                '& .MuiAlert-icon': {
                    color: '#fff',
                },
            }}
        >
            {message ?? 'This is a snackbar message!'}
        </Alert>
    </Snackbar>
);
};

export default MUISnackbar;
