import React, { useEffect, useState } from "react";
import {
    Button,
    Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../styles/complianceCategory_modules/complianceCategory.css";
import ComplianceCategoryTable from "./ComplianceCategoryTable";
import AddEditComplianceCategory from "./AddEditComplianceCategory";
import ConfirmDialog from "./ConfirmDialog";
import axiosInstance from "../../../config/axiosInstance";

export default function ComplianceCategoryPage() {
    const [data, setData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const fetchComplianceCategorys = async () => {
        try {
            const res = await axiosInstance.get("/api/compcateg/fetch");
            setData(res.data.data);
        } catch (error) {
            console.error("Fetch complianceCategorys failed:", error);
        }
    };

    useEffect(() => {
        fetchComplianceCategorys();
    }, []);

    const handleDelete = async (ids) => {
        try {
            await axiosInstance.delete(`/api/compcateg/delete?id=${ids}`);

            fetchComplianceCategorys();
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

            <div className="complianceCategory-container">
                <Stack direction="row" spacing={2} mb={2}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => {
                            setEditData(null);
                            setOpenForm(true);
                        }}
                    >
                        Add ComplianceCategory
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

                <div className="complianceCategory-table">
                    <ComplianceCategoryTable
                        rows={data}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={(row) => {
                            setEditData(row);
                            setOpenForm(true);
                        }}
                        onRefresh={fetchComplianceCategorys}
                    />
                </div>
                
                <AddEditComplianceCategory
                    open={openForm}
                    data={editData}
                    onClose={() => setOpenForm(false)}
                    onSuccess={fetchComplianceCategorys}
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
