import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Typography
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  message,
  action,
  onClose
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={() => {
          action();
          onClose();
        }}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
