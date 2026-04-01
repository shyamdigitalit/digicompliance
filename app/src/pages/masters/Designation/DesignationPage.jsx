import React, { useEffect, useState } from "react";
import {
    Button,
    Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../styles/designation_modules/designation.css";
import DesignationTable from "./DesignationTable";
import AddEditDesignation from "./AddEditDesignation";
import ConfirmDialog from "./ConfirmDialog";
import axiosInstance from "../../../config/axiosInstance";

export default function DesignationPage() {
    const [data, setData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const fetchDesignations = async () => {
        try {
            const res = await axiosInstance.get("/api/desig/fetch");
            setData(res.data.data);
        } catch (error) {
            console.error("Fetch designations failed:", error);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);


    useEffect(() => {
        fetchDesignations();
    }, []);

    const handleDelete = async (ids) => {
        try {
            await axiosInstance.delete(`/api/desig/delete?id=${ids}`);

            fetchDesignations();
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

            <div className="designation-container">
                <Stack direction="row" spacing={2} mb={2}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => {
                            setEditData(null);
                            setOpenForm(true);
                        }}
                    >
                        Add Designation
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

                <div className="designation-table">
                    <DesignationTable
                        rows={data}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        onEdit={(row) => {
                            setEditData(row);
                            setOpenForm(true);
                        }}
                        onRefresh={fetchDesignations}
                    />
                </div>

                <AddEditDesignation
                    open={openForm}
                    data={editData}
                    onClose={() => setOpenForm(false)}
                    onSuccess={fetchDesignations}
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
