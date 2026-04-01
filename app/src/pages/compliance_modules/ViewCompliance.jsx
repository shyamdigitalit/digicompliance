import React from "react";
import { useDispatch } from 'react-redux'
import AddCompliance from "./AddCompliance";
import "../../styles/compliance_modules/ViewCompliance.css";
import axiosInstance from "../../config/axiosInstance";
import { showSnackbar } from '../../redux/slices/snackbar';
import { SquarePen } from 'lucide-react';
import { X } from 'lucide-react';


export default function ViewComplianceModal({ data, onClose }) {
  const dispatch = useDispatch()
  const [mode, setMode] = React.useState("view");
  // console.log(data);

  const handleEdit = async (row) => {
    try {
      const res = await axiosInstance.patch(`/api/comp/update?id=${data._id}`, row);
      console.log("RESPONSE FROM SERVER:", res.data);

      if (res.status === 201) {
        dispatch(showSnackbar({ message: 'Compliance updated successfully.', severity: 'success' }));
        // setShowAdd(false);
      }
      else {
        // setShowAdd(true);
        dispatch(showSnackbar({ message: 'Failed to update compliance.', severity: 'error' }));
      }
    } catch (error) {
      console.error(error);
      dispatch(showSnackbar({ message: error?.message, severity: 'error' }));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{mode === "view" ? "View Compliance" : "Edit Compliance"}</h3>

          <div className="modal-actions">
            {mode === "view" && (
              <button
                className="icon-btn edit"
                data-tooltip="Edit"
                onClick={() => setMode("edit")}
              >
                <SquarePen />
              </button>
            )}

            <button className="icon-btn close" data-tooltip="Close" onClick={onClose}>
              <X />
            </button>
          </div>
        </div>

        <AddCompliance
          mode={mode}
          initialData={data}
          onCancel={onClose}
          onSubmit={(formData) => {
            console.log("✅ EDIT SUBMIT CALLED");
            console.log([...formData.entries()]);
            handleEdit(formData)
            
            onClose();
          }}
        />
      </div>
    </div>
  );
}
