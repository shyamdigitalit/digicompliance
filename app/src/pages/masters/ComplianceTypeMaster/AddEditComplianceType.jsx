import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditComplianceType({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    complianceTypeName: "",
    complianceTypeCode: "",
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
          `/api/comptyp/update?id=${data._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/comptyp/create", form);
      }

      onSuccess();  // refresh list
      onClose();    // close modal
    } catch (error) {
      console.error(
        "CompType submit failed:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {data ? "Update ComplianceType" : "Add ComplianceType"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="ComplianceType Name"
            value={form.complianceTypeName}
            onChange={e => setForm({ ...form, complianceTypeName: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
