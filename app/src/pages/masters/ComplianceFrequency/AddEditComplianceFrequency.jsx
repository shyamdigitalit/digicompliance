import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditComplianceFrequency({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    complianceFrequencyName: "",
    complianceFrequencyCode: "",
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
          `/api/compfreq/update?id=${data._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/compfreq/create", form);
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
        {data ? "Update ComplianceFrequency" : "Add ComplianceFrequency"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="ComplianceFrequency Name"
            value={form.complianceFrequencyName}
            onChange={e => setForm({ ...form, complianceFrequencyName: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
