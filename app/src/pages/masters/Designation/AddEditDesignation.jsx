import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditdesignation({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    designationName: "",
    designationCode: "",
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
          `/api/desig/update/${data._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/desig/create", form);
      }

      onSuccess();  // refresh list
      onClose();    // close modal
    } catch (error) {
      console.error(
        "Plant submit failed:",
        error.response?.data || error.message
      );
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {data ? "Update designation" : "Add designation"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="designation Name"
            value={form.designationName}
            onChange={e => setForm({ ...form, designationName: e.target.value })}
          />
          <TextField
            label="designation Code"
            value={form.designationCode}
            onChange={e => setForm({ ...form, designationCode: e.target.value })}
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
