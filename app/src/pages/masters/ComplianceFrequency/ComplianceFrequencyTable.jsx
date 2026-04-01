import {
  Table, TableHead, TableRow, TableCell,
  TableBody, Checkbox, IconButton, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "../../../config/axiosInstance";
import ConfirmDialog from "./ConfirmDialog";
import { useState } from "react";

export default function ComplianceFrequencyTable({
  rows,
  selectedIds,
  setSelectedIds,
  onEdit,
  onRefresh
}) {
  const [confirm, setConfirm] = useState(null);

  const toggleStatus = async (row) => {
    try {
      await axiosInstance.patch("/api/compfreq/update", {
        _id: row._id,
        status: !row.status
      });
      onRefresh();
    } catch (error) {
      console.error("Status toggle failed:", error);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Updated By</TableCell>        
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map(row => (
            <TableRow key={row._id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.includes(row._id)}
                  onChange={() => handleSelect(row._id)}
                />
              </TableCell>

              <TableCell>{row.complianceFrequencyName}</TableCell>
              <TableCell>
                <Chip
                  label={row.status ? "Active" : "Inactive"}
                  color={row.status ? "success" : "default"}
                  clickable
                  onClick={() =>
                    setConfirm({
                      title: "Change Status",
                      message: `Mark as ${row.status ? "Inactive" : "Active"}?`,
                      action: () => toggleStatus(row)
                    })
                  }
                />
              </TableCell>

              <TableCell align="center">

                <IconButton onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!confirm}
        {...confirm}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
