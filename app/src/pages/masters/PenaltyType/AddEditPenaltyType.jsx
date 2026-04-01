import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditPenaltyType({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    penaltyTypeName: "",
    penaltyTypeCode: "",
    description: ""
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async () => {
    try {
      if (data?._id) {
        // UPDATE
        await axiosInstance.patch(
          `/api/penlty/update?id=${data?._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/penlty/create", form);
      }

      onSuccess();  // refresh list
      onClose();    // close modal
    } catch (error) {
      console.error(
        "Penalty submit failed:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {data ? "Update PenaltyType" : "Add PenaltyType"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="PenaltyType Name"
            value={form.penaltyName}
            onChange={e => setForm({ ...form, penaltyName: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
