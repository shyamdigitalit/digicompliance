import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditComplianceCategory({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    complianceCategoryName: "",
    complianceCategoryCode: "",
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
          `/api/compcateg/update?id=${data._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/compcateg/create", form);
      }

      onSuccess();  // refresh list
      onClose();    // close modal
    } catch (error) {
      console.error(
        "CompCategory submit failed:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {data ? "Update ComplianceCategory" : "Add ComplianceCategory"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="ComplianceCategory Name"
            value={form.complianceCategoryName}
            onChange={e => setForm({ ...form, complianceCategoryName: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
