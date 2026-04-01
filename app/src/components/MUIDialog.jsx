import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

const MUIDialog = ({
  open,
  onClose,
  title,
  content,
  actions,
  fullWidth = true,
  maxWidth = 'sm',
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth={fullWidth} maxWidth={maxWidth}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>
        <Box>{content}</Box>
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default MUIDialog;
