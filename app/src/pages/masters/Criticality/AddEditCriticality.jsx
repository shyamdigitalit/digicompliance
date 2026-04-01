import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Stack
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosInstance from "../../../config/axiosInstance";

export default function AddEditCriticality({ open, data, onClose, onSuccess }) {
  const [form, setForm] = useState({
    criticalityName: "",
    criticalityCode: "",
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
          `/api/criticlty/update?id=${data._id}`,
          form
        );
      } else {
        await axiosInstance.post("/api/criticlty/create", form);
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
        {data ? "Update Criticality" : "Add Criticality"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Criticality Name"
            value={form.criticalityName}
            onChange={e => setForm({ ...form, criticalityName: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
