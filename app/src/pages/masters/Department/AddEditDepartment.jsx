import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditDepartment({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    departmentName: "",
    departmentCode: "",
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
          `/api/dept/update/${data._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/dept/create", form);
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
        {data ? "Update Department" : "Add Department"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Department Name"
            value={form.departmentName}
            onChange={e => setForm({ ...form, departmentName: e.target.value })}
          />
          <TextField
            label="Department Code"
            value={form.departmentCode}
            onChange={e => setForm({ ...form, departmentCode: e.target.value })}
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
