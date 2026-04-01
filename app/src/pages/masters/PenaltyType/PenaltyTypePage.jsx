import React, { useEffect, useState } from "react";
import {
    Button,
    Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../styles/penaltyType_modules/penaltyType.css";
import PenaltyTypeTable from "./PenaltyTypeTable";
import AddEditPenaltyType from "./AddEditPenaltyType";
import ConfirmDialog from "./ConfirmDialog";
import axiosInstance from "../../../config/axiosInstance";

export default function PenaltyTypePage() {
    const [data, setData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const fetchPenaltyTypes = async () => {
        try {
            const res = await axiosInstance.get("/api/penlty/fetch");
            setData(res.data.data);
        } catch (error) {
            console.error("Fetch penaltyTypes failed:", error);
        }
    };

    useEffect(() => {
        fetchPenaltyTypes();
    }, []);

    const handleDelete = async (ids) => {
        try {
            await axiosInstance.delete(`/api/penlty/delete?id=${ids}`);

            fetchPenaltyTypes();
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

            <div className="penaltyType-container">
                <Stack direction="row" spacing={2} mb={2}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => {
                            setEditData(null);
                            setOpenForm(true);
                        }}
                    >
                        Add PenaltyType
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

                <div className="penaltyType-table">
                    <PenaltyTypeTable
                        rows={data}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={(row) => {
                            setEditData(row);
                            setOpenForm(true);
                        }}
                        onRefresh={fetchPenaltyTypes}
                    />
                </div>
                
                <AddEditPenaltyType
                    open={openForm}
                    data={editData}
                    onClose={() => setOpenForm(false)}
                    onSuccess={fetchPenaltyTypes}
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
