import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditplant({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    plantName: "",
    plantCode: "",
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
        `/api/plnt/update/${data._id}`,
        form
      );
    } else {
      await axiosInstance.post("/api/plnt/create", form);
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
        {data ? "Update plant" : "Add plant"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="plant Name"
            value={form.plantName}
            onChange={e => setForm({ ...form, plantName: e.target.value })}
          />
          <TextField
            label="plant Code"
            value={form.plantCode}
            onChange={e => setForm({ ...form, plantCode: e.target.value })}
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
