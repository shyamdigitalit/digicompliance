import React, { useEffect, useState } from "react";
import {
    Button,
    Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../styles/criticality_modules/criticality.css";
import CriticalityTable from "./CriticalityTable";
import AddEditCriticality from "./AddEditCriticality";
import ConfirmDialog from "./ConfirmDialog";
import axiosInstance from "../../../config/axiosInstance";

export default function CriticalityPage() {
    const [data, setData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const fetchCriticalitys = async () => {
        try {
            const res = await axiosInstance.get("/api/criticlty/fetch");
            setData(res.data.data);
        } catch (error) {
            console.error("Fetch criticalitys failed:", error);
        }
    };

    useEffect(() => {
        fetchCriticalitys();
    }, []);

    const handleDelete = async (ids) => {
        try {
            await axiosInstance.delete(`/api/criticlty/delete?id=${ids}`);

            fetchCriticalitys();
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

            <div className="criticality-container">
                <Stack direction="row" spacing={2} mb={2}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => {
                            setEditData(null);
                            setOpenForm(true);
                        }}
                    >
                        Add Criticality
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

                <div className="criticality-table">
                    <CriticalityTable
                        rows={data}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={(row) => {
                            setEditData(row);
                            setOpenForm(true);
                        }}
                        onRefresh={fetchCriticalitys}
                    />
                </div>
                
                <AddEditCriticality
                    open={openForm}
                    data={editData}
                    onClose={() => setOpenForm(false)}
                    onSuccess={fetchCriticalitys}
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
