import React, { useEffect, useState } from "react";
import {
    Button,
    Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../styles/complianceType_modules/complianceType.css";
import ComplianceTypeTable from "./ComplianceTypeTable";
import AddEditComplianceType from "./AddEditComplianceType";
import ConfirmDialog from "./ConfirmDialog";
import axiosInstance from "../../../config/axiosInstance";

export default function ComplianceTypePage() {
    const [data, setData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const fetchComplianceTypes = async () => {
        try {
            const res = await axiosInstance.get("/api/comptyp/fetch");
            setData(res.data.data);
        } catch (error) {
            console.error("Fetch complianceTypes failed:", error);
        }
    };

    useEffect(() => {
        fetchComplianceTypes();
    }, []);

    const handleDelete = async (ids) => {
        try {
            await axiosInstance.delete(`/api/comptyp/delete?id=${ids}`);

            fetchComplianceTypes();
            setSelectedIds([]);
        } catch (error) {
            console.error(
                "Delete failed:",
                error.response?.data || error.message
            );
        }
    };

    return (
        <>

            <div className="complianceType-container">
                <Stack direction="row" spacing={2} mb={2}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => {
                            setEditData(null);
                            setOpenForm(true);
                        }}
                    >
                        Add ComplianceType
                    </Button>

                    <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={selectedIds.length !== 1}
                        onClick={() =>
                            setConfirm({
                                title: "Remove Selected",
                                message: "Are you sure?",
                                action: () => handleDelete(selectedIds[0]) // pass single ID
                            })
                        }
                    >
                        Remove Selected
                    </Button>

                </Stack>

                <div className="complianceType-table">
                    <ComplianceTypeTable
                        rows={data}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={(row) => {
                            setEditData(row);
                            setOpenForm(true);
                        }}
                        onRefresh={fetchComplianceTypes}
                    />
                </div>
                
                <AddEditComplianceType
                    open={openForm}
                    data={editData}
                    onClose={() => setOpenForm(false)}
                    onSuccess={fetchComplianceTypes}
                />

                <ConfirmDialog
                    open={!!confirm}
                    {...confirm}
                    onClose={() => setConfirm(null)}
                />
            </div>
        </>
    );
}
