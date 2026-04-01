import React from 'react'
import Datatable from '../../../utilities/Datatable'
import axiosInstance from '../../../config/axiosInstance'
import { Dialog, DialogTitle, DialogContent, Chip, Toolbar, IconButton, Tooltip, Zoom } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import AddEditForm from './AddEditForm';
import { showSnackbar } from '../../../redux/slices/snackbar';
import { useDispatch } from 'react-redux';

const Function = () => {
  const dispatch = useDispatch()
  const [drw, setDrw] = React.useState([])
  const [openModal, setOpenModal] = React.useState(false)
  const [selectedRows, setSelectedRows] = React.useState([])
  const [addVisible, setAddVisible] = React.useState(true)
  const [edtVisible, setEdtVisible] = React.useState(false)
  const [rmvVisible, setRmvVisible] = React.useState(false)
  const [editData, setEditData] = React.useState(null) // ✅ Added for Edit functionality

  const getDta = React.useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/func/fetch`)
      const dta = res.data
      if (res.status === 200) {
        setDrw(dta.data.map((elm, i) => ({
          serial: i + 1,
          id: elm._id,
          ...elm
        })))
      }
      else {
        console.warn(dta.message)
      }
    } catch (error) {
      console.error(error.message)
    }
  }, [])
  React.useEffect(() => {
    getDta()
  }, [getDta])

  // 🔹 Create New Policy
  const handleAddNew = async (formData) => {
    try {
      const res = await axiosInstance.post(`/api/func/create`, formData)
      const dta = res.data
      if (res.status === 201) {
        dispatch(showSnackbar({ message: dta.message, severity: 'success' }))
        getDta()
        setOpenModal(false)
      } else {
        dispatch(showSnackbar({ message: dta.message, severity: 'error' }))
      }
    } catch (error) {
      console.error(error)
      dispatch(showSnackbar({ message: error?.response?.data?.message, severity: 'error' }))
    }
  }

  // ✅ Update Existing Policy
  const handleEditSave = async (formData) => {
    try {
      const res = await axiosInstance.put(`/api/func/update?id=${editData._id}`, formData);
      const dta = res.data;

      if (res.status === 201) {
        dispatch(showSnackbar({ message: dta.message, severity: 'success' }));
        getDta();
        setEditData(null); // ✅ clear edit mode
        setOpenModal(false);
      } else {
        dispatch(showSnackbar({ message: dta.message, severity: 'error' }));
      }
    } catch (error) {
      console.error(error);
      dispatch(showSnackbar({ message: error?.response?.data?.message, severity: 'error' }))
    }
  };

  // ✅ Track selection changes
  const handleSelectionChange = (selection) => {
    setSelectedRows(selection);

    let selectedCount = 0;

    if (selection?.type === "include") {
      selectedCount = selection.ids.size;
    }
    else if (selection?.type === "exclude") {
      const excluded = selection.ids.size;
      selectedCount = drw.length - excluded;
    }

    setAddVisible(selectedCount === 0);
    setEdtVisible(selectedCount === 1);
    setRmvVisible(selectedCount > 0);
  };

  // ✅ Open Modal in Edit Mode
  const handleEditClick = () => {
    const ids = Array.from(selectedRows?.ids || []);
    if (ids.length !== 1) {
      dispatch(showSnackbar({
        message: "Please select exactly one row to edit.",
        severity: 'warning'
      }));
      return;
    }

    const selected = drw.find((r) => r.id === ids[0]);
    if (selected) {
      setEditData(selected); // ✅ set data for form
      setOpenModal(true);
    }
  };

  // 🔹 On Cell row Update
  const handleEditCellChange = async (updatedRow, originalRow) => {
    try {
      // Ask for confirmation
      const confirmed = confirm(`Are you sure you want to update this row?`);

      if (!confirmed) {
        // Cancel update → return the original row to keep grid unchanged
        return originalRow;
      }

      const payLoad = {
        func_name: updatedRow.func_name,
        func_heirarchy: updatedRow.func_heirarchy,
        func_path: updatedRow.func_path,
        func_query: updatedRow.func_query,
        func_icon: updatedRow.func_icon,
      };

      if (payLoad.func_name || payLoad.func_path || payLoad.func_query || payLoad.func_icon || payLoad.func_heirarchy) {
        payLoad.status = 'Active';
        console.log(payLoad);

        const res = await axiosInstance.put(`/api/func/update?id=${updatedRow.id}`, payLoad);
        const dta = res.data;

        if (res.status === 201) {
          dispatch(showSnackbar({ message: dta.message, severity: 'success' }))
          return { ...updatedRow }; // ✅ return updated row
        } else {
          dispatch(showSnackbar({ message: dta.message, severity: 'error' }))
          throw new Error(dta.message || "Update failed");
        }
      }
      else {
        dispatch(showSnackbar({ message: "Nothing changed !", severity: 'info' }))
        return originalRow;
      }
    } catch (error) {
      console.error(error);
      throw error; // handled by onProcessRowUpdateError
    }
  };

  // 🔹 Toggle Status
  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "Active" ? "Inactive": (row.status === "Inactive" ? "Active" : row.status);

    try {
      if (["Active","Inactive"].includes(newStatus)) {
        if (!window.confirm(`Change status of "${row.func_name}" to "${newStatus}" ?`)) return;
        const res = await axiosInstance.put(`/api/func/update?id=${row._id}`, { status: newStatus })
        const dta = res.data
        if (res.status === 201) {
          dispatch(showSnackbar({ message: dta.message, severity: 'success' }))
          getDta()
        } else {
          dispatch(showSnackbar({ message: dta.message, severity: 'error' }))
        }
      }
    } catch (error) {
      console.error(error)
      dispatch(showSnackbar({ message: error?.response?.data?.message, severity: 'error' }))
    }
  }

  // 🔹 Remove selected
  const handleRemove = async () => {
    if (!selectedRows || !selectedRows.type) {
      dispatch(showSnackbar({ message: "No rows selected for deletion!", severity: 'warning' }));
      return;
    }

    let idsToDelete = [];

    if (selectedRows.type === "include") {
      idsToDelete = Array.from(selectedRows.ids);
    } else if (selectedRows.type === "exclude") {
      const excludedIds = Array.from(selectedRows.ids);
      idsToDelete = drw.map(r => r.id).filter(id => !excludedIds.includes(id));
    }

    if (idsToDelete.length === 0) {
      dispatch(showSnackbar({ message: "No rows selected for deletion!", severity: 'warning' }));
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${idsToDelete.length} selected row(s)?`)) return;

    try {
      for (let rowId of idsToDelete) {
        const row = drw.find(r => r.id === rowId);
        if (row?._id) {
          await axiosInstance.delete(`/api/func/delete?id=${row._id}`);
        }
      }
      dispatch(showSnackbar({ message: "Selected rows deleted successfully", severity: 'success' }));
      getDta();
      setSelectedRows({ type: "include", ids: new Set() });
    } catch (error) {
      console.error(error);
      dispatch(showSnackbar({ message: error?.response?.data?.message, severity: 'error' }))
    }
  };
  
  const dataFields = [
    { field: 'serial', headerName: 'Sl.No.', width: 75 },
    { field: 'func_name', headerName: 'Name', width: 150, editable: true },
    { field: 'func_heirarchy', headerName: 'Hierarchy', width: 100, editable: true },
    { field: 'func_path', headerName: 'Path', width: 200, editable: true },
    { field: 'func_query', headerName: 'Query', width: 300, editable: true },
    { field: 'func_icon', headerName: 'Icon', width: 200, editable: true },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Active" ? "success" : "default"}
          sx={{ cursor: "pointer" }}
          onClick={() => handleStatusToggle(params.row)}   // ✅ toggle on click
        />
      )
    },
    { field: 'createdAtITC', headerName: 'Created On', width: 300 },
    { field: 'updatedAtITC', headerName: 'Updated At', width: 300 },
  ];

  return (
    <div className='main-body'>
      <div className="main-hdr">
        <span className='hds'>Function Details</span>
      </div>

      <div className="main-dtl">
        <Datatable
          rows={drw}
          columns={dataFields}
          addBtn={addVisible}
          edtBtn={edtVisible}
          rmvBtn={rmvVisible}
          onSelectionChange={handleSelectionChange}
          onAddNew={() => {
            setEditData(null); // ✅ ensure clean form
            setOpenModal(true);
          }}
          onEdit={handleEditClick}
          onRemove={handleRemove}
          handleEditCellChange={handleEditCellChange}
        />

        {/* ✅ Common Add/Edit Modal */}
        <Dialog
          open={openModal}
          // fullScreen
          onClose={() => setOpenModal(false)}
        >
          <Toolbar sx={{
            display: 'flex',
            justifyContent: 'space-between',
            bgcolor: 'primary.main',
            color: 'primary.dark'
          }}>
            <DialogTitle sx={{ p: 0 }}>
              {editData ? 'Edit Function' : 'Add New Function'}
            </DialogTitle>
            <Tooltip title="Close" placement="bottom" arrow TransitionComponent={Zoom}>
              <IconButton color="inherit" onClick={() => setOpenModal(false)}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>

          <DialogContent>
            <AddEditForm
              initialData={editData || {}} // ✅ prefill for edit
              onSubmit={editData ? handleEditSave : handleAddNew} // ✅ conditional save
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Function
