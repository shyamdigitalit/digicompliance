import React from "react";
import "../styles/Compliance.css";
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCompliance from "./AddCompliance";
import axiosInstance from "../../config/axiosInstance";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Loader from "../../components/loader";
import moment from 'moment';
import { logActivity } from "../utils/activityLog";

const COMPLIANCE_KEY = "compliance_data";
const ACTIVITY_KEY = "activity_log";

const PAGE_SIZE = 8;

/* ── Export Modal ── */
// const ExportModal = React.memo(({ filtered, onClose, onExport }) => {
//   const [selectAll, setSelectAll] = React.useState(false);
//   const [count, setCount] = React.useState("");
//   const total = filtered.length;

//   const handleSelectAll = () => {
//     setSelectAll(true);
//     setCount(String(total));
//   };

//   const handleCountChange = (e) => {
//     setSelectAll(false);
//     const val = e.target.value.replace(/\D/g, "");
//     setCount(val);
//   };

//   const handleExport = () => {
//     const n = selectAll ? total : Math.min(parseInt(count) || 0, total);
//     if (n === 0) { alert("Please enter a valid count or select all."); return; }
//     onExport(filtered.slice(0, n));
//   };

//   return (
//     <div className="doc-modal-overlay" onClick={onClose}>
//       <div className="doc-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
//         <div className="doc-modal-header">
//           <h3>Export Compliance</h3>
//           <button className="doc-modal-close" onClick={onClose}>✕</button>
//         </div>
//         <p className="doc-modal-sub" style={{ marginBottom: 16 }}>
//           {total} record{total !== 1 ? "s" : ""} available. Choose how many to export.
//         </p>

//         <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
//           <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Number of records</label>
//           <input
//             type="number"
//             min={1}
//             max={total}
//             value={count}
//             placeholder={`Enter count (max ${total})`}
//             onChange={handleCountChange}
//             style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
//           />
//           <button
//             className={selectAll ? "dark-btn" : "light-btn"}
//             onClick={handleSelectAll}
//             style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}
//           >
//             {selectAll ? "✓ All selected" : "Select All"} ({total} records)
//           </button>
//         </div>

//         <div className="doc-modal-footer">
//           <button className="light-btn" onClick={onClose}>Cancel</button>
//           <button className="dark-btn" onClick={handleExport}>
//             {selectAll ? `Export All (${total})` : `Export${count ? ` (${Math.min(parseInt(count)||0,total)})` : ""}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// });

const Compliance = React.memo(function Compliance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [masterData, setMasterData] = React.useState({
    plants: [],
    departments: [],
    complianceTypes: [],
    complianceCategories: [],
    complianceFrequencies: [],
    criticalities: [],
    penaltyTypes: []
  });
  const [data, setData] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  // const [showExportModal, setShowExportModal] = React.useState(false);
  const [showExportSelection, setShowExportSelection] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState([]);

  const user = useSelector(state => state.auth.user)

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/comp/fetch");
      setData(response.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchMasterData = React.useCallback(async () => {
    try {
      const [plantsRes, deptsRes, typesRes, categoriesRes, freqsRes, critsRes, penltsRes] = await Promise.allSettled([
        axiosInstance.get("/api/plnt/fetch"),
        axiosInstance.get("/api/dept/fetch"),
        axiosInstance.get("/api/comptyp/fetch"),
        axiosInstance.get("/api/compcateg/fetch"),
        axiosInstance.get("/api/compfreq/fetch"),
        axiosInstance.get("/api/criticlty/fetch"),
        axiosInstance.get("/api/penlty/fetch")
      ]);
      setMasterData({
        plants: plantsRes.value?.data?.data || [],
        departments: deptsRes.value?.data?.data || [],
        complianceTypes: typesRes.value?.data?.data || [],
        complianceCategories: categoriesRes.value?.data?.data || [],
        complianceFrequencies: freqsRes.value?.data?.data || [],
        criticalities: critsRes.value?.data?.data || [],
        penaltyTypes: penltsRes.value?.data?.data || []
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  React.useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const [search, setSearch] = React.useState("");
  const [filterPlant, setFilterPlant] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterApprovalStatus, setFilterApprovalStatus] = React.useState("");
  const [filterCompTyp, setFilterCompTyp] = React.useState("");
  const [filterCompCat, setFilterCompCat] = React.useState("");
  const [filterCompFreq, setFilterCompFreq] = React.useState("");
  const [filterCriticality, setFilterCriticality] = React.useState("");
  const [filterPenaltyType, setFilterPenaltyType] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Store pending URL params from Dashboard navigation in a ref
  // so they can be applied once data has loaded (avoids race condition)
  const pendingParams = React.useRef(null);

  // Step 1: Read URL params and stash them; don't apply filters yet
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.toString()) return;
    pendingParams.current = {
      criticality: params.get("criticality") || "",
      status: params.get("status") || "",
      approvalStatus: params.get("approvalStatus") || "",
      complianceId: params.get("complianceId") || "",
      q: params.get("q") || "",
    };
    navigate("/compliance", { replace: true });
  }, [location.search]);

  // Step 2: Once data loads (from empty → populated), apply stashed params
  React.useEffect(() => {
    if (data.length > 0 && pendingParams.current) {
      const p = pendingParams.current;
      pendingParams.current = null;
      if (p.criticality) setFilterCriticality(p.criticality);
      if (p.status) setFilterStatus(p.status);
      if (p.approvalStatus) setFilterApprovalStatus(p.approvalStatus);
      if (p.complianceId) setSearch(p.complianceId);
      else if (p.q) setSearch(p.q);
      setPage(1);
    }
  }, [data]);

  React.useEffect(() => {
    localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(data));
  }, [data]);


  // Data Filters
  const plants = React.useMemo(() => [...new Set(data?.map(d => d.plant?.name || ""))], [data]);
  const depts = React.useMemo(() => [...new Set(data?.map(d => d.department?.name || ""))], [data]);
  const complianceTypes = React.useMemo(() => [...new Set(data?.map(d => d.complianceType?.name || ""))], [data]);
  const complianceCategories = React.useMemo(() => [...new Set(data?.map(d => d.complianceCategorization?.name || ""))], [data]);
  const complianceFrequencies = React.useMemo(() => [...new Set(data?.map(d => d.complianceFrequency?.name || ""))], [data]);
  const criticalities = React.useMemo(() => [...new Set(data?.map(d => d.criticality?.name || ""))], [data]);
  const penaltyTypes = React.useMemo(() => [...new Set(data?.map(d => d.penaltyType?.name || ""))], [data]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return data?.filter(item => {
      const matchSearch = !q ||
        (item.complianceId || "").toLowerCase().includes(q) ||
        (item.complianceType?.name || "").toLowerCase().includes(q) ||
        (item.complianceCategorization?.name || "").toLowerCase().includes(q) ||
        (item.plant?.name || "").toLowerCase().includes(q);
      const matchPlant = !filterPlant || item.plant?.name === filterPlant;
      const matchDept = !filterDept || item.department?.name === filterDept;
      const matchStatus = !filterStatus ||
        (filterStatus === "__open_pending__"
          ? ["open", "pending"].includes((item.status || "").toLowerCase().trim())
          : (item.status || "").toLowerCase().trim() === filterStatus.toLowerCase().trim());
      // "PENDING" sentinel = records not yet approved (null/empty/Pending)
      // "APPROVED" sentinel = records that have been approved (any truthy non-pending value)
      const normalizedApproval = (item.approvalStatus || "").toLowerCase().trim();
      const isApproved = normalizedApproval !== "" && normalizedApproval !== "pending" && normalizedApproval !== "rejected";
      const matchApproval = !filterApprovalStatus ||
        (filterApprovalStatus === "__pending__"
          ? !isApproved
          : filterApprovalStatus === "__approved__"
            ? isApproved
            : normalizedApproval === filterApprovalStatus.toLowerCase().trim());
      const matchCompTyp = !filterCompTyp || item.complianceType?.name === filterCompTyp;
      const matchCompCat = !filterCompCat || item.complianceCategorization?.name === filterCompCat;
      const matchCompFreq = !filterCompFreq || item.complianceFrequency?.name === filterCompFreq;
      const matchCriticality = !filterCriticality || item.criticality?.name === filterCriticality;
      const matchPenaltyType = !filterPenaltyType || item.penaltyType?.name === filterPenaltyType;
      return matchSearch && matchPlant && matchDept && matchStatus && matchApproval && matchCompTyp && matchCompCat && matchCompFreq && matchCriticality && matchPenaltyType;
    });
  }, [data, search, filterPlant, filterDept, filterStatus, filterApprovalStatus, filterCompTyp, filterCompCat, filterCompFreq, filterCriticality, filterPenaltyType]);

  const resetFilters = React.useCallback(() => {
    setSearch('');
    setFilterPlant('');
    setFilterDept('');
    setFilterStatus('');
    setFilterApprovalStatus('');
    setFilterCompTyp('');
    setFilterCompCat('');
    setFilterCompFreq('');
    setFilterCriticality('');
    setFilterPenaltyType('');
    setPage(1);
  }, [
    setSearch,
    setFilterPlant,
    setFilterDept,
    setFilterStatus,
    setFilterApprovalStatus,
    setFilterCompTyp,
    setFilterCompCat,
    setFilterCompFreq,
    setFilterCriticality,
    setFilterPenaltyType,
    setPage
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  // Data Manipulation Handlers
  const handleAddEditSubmit = React.useCallback(async (formData) => {
    try {
      if (editing) {
        const response = await axiosInstance.patch(`/api/comp/update?id=${editing?._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        console.log(editing);
        if (response.status === 201) {
          logActivity("Compliance Updated", editing?.complianceId || editing?._id, user);
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setShowAddForm(false);
            fetchData();
          }, 1000);
        } else {
          alert("Failed to add compliance. Please try again.");
        }
      } else {
        const response = await axiosInstance.post("/api/comp/create", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (response.status === 201) {
          logActivity("Compliance Added", response.data?.data?.complianceId || "", user);
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setShowAddForm(false);
            fetchData();
          }, 1000);
        } else {
          alert("Failed to add compliance. Please try again.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [editing, setSaved, setShowAddForm, fetchData, user]);

  const handleEdit = React.useCallback((row) => {
    setEditing(row);
    setShowAddForm(true);
  }, [setEditing, setShowAddForm]);

  const handleZipDownload = React.useCallback(async (value = [], label = "Compliance_Files") => {
    if (!value || value.length === 0) {
      alert(`No files available for download!`);
      return;
    }
    try {
      const backendFiles = value.filter(f => f.filId);
      const localFiles = value.filter(f => f instanceof File);
      const urlFiles = value.filter(f => f.filUrl && !f.filId);

      if (backendFiles.length > 0) {
        try {
          const fileIds = backendFiles.map(f => f.filId).join(',');
          const response = await axiosInstance.get(
            `/api/file/downloadall?files=${fileIds}`,
            { responseType: 'blob' }
          );
          const blob = new Blob([response.data], { type: 'application/zip' });
          saveAs(blob, `${label}.zip`);
          logActivity("Compliance Downloaded", label, user);
          alert(`Files downloaded successfully!`);
          return;
        } catch (err) {
          console.log(err);
          alert(`Backend ZIP failed, trying fallback.`);
        }
      }

      const zip = new JSZip();
      for (const file of localFiles) {
        zip.file(file.name, file);
      }
      for (const file of urlFiles) {
        const response = await fetch(file.filUrl);
        const blob = await response.blob();
        zip.file(file.filName || "file", blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${label}.zip`);
      logActivity("Compliance Downloaded", label, user);
      alert(`ZIP exported successfully!`);
    } catch (err) {
      console.error(err);
      alert(`ZIP download failed.`);
    }
  }, []);

  const handleApprove = React.useCallback(async (row) => {
    try {
      if (window.confirm("Approve this compliance record?")) {
        const response = await axiosInstance.patch(`/api/comp/approve?id=${row._id}&flg=1`, row);
        if (response.status === 201) {
          logActivity("Compliance Approved", row.complianceId || row._id, user);
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setShowAddForm(false);
            fetchData();
          }, 1000);
        } else {
          alert(`Approval Failed`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [setSaved, setShowAddForm, fetchData, user]);

  const handleReject = React.useCallback(async (row) => {
    try {
      if (window.confirm("Reject this compliance record?")) {
        const response = await axiosInstance.patch(`/api/comp/approve?id=${row._id}&flg=0`, row);
        if (response.status === 201) {
          logActivity("Compliance Rejected", row.complianceId || row._id, user);
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setShowAddForm(false);
            fetchData();
          }, 1000);
        } else {
          alert(`Rejection Failed`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [setSaved, setShowAddForm, fetchData, user]);

  const handleDelete = React.useCallback(async (id) => {
    try {
      if (window.confirm("Delete this compliance record?")) {
        const response = await axiosInstance.delete(`/api/comp/delete?id=${id}`);
        console.log(response.data);
        if (response.status === 200) {
          logActivity("Compliance Deleted", response.data?.data?.complianceId || id, user);
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            fetchData();
          }, 1000);
        } else {
          alert(`Deletion Failed`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [setSaved, fetchData, user]);

  const handleStatusChange = React.useCallback((id, newStatus) => {
    setData(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
    logActivity("Compliance Status Changed", `Status set to ${newStatus}`, user);
  }, [user]);

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filtered.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filtered.map(item => item._id));
    }
  };

  const handleExportConfirm = React.useCallback((exportRows) => {
    const exportData = exportRows?.map(({
      _id,
      complianceId,
      plant,
      department,
      complianceType,
      complianceCategorization,
      complianceFrequency,
      criticality,
      penaltyType,
      dueDate,
      createdby,
      updatedby,
      ...rest
    }) => ({
      complianceId,
      plant: plant?.name,
      department: department?.name,
      complianceType: complianceType?.name,
      complianceCategorization: complianceCategorization?.name,
      complianceFrequency: complianceFrequency?.name,
      criticality: criticality?.name,
      penaltyType: penaltyType?.name,
      dueDate,
      createdby: createdby?.acc_fname,
      updatedby: updatedby?.acc_fname,
      ...rest
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Compliance'
    );

    XLSX.writeFile(workbook, 'Compliance_Datasheet.xlsx');

    logActivity(
      "Compliance Exported",
      `${exportData.length} records`,
      user
    );
  }, [user]);

  const handleExport = React.useCallback(() => {
    if (!filtered.length) {
      alert("No data available to export.");
      return;
    }

    if (!showExportSelection) {
      setShowExportSelection(true);
      return;
    }

    const exportRows =
      selectedRows.length === filtered.length
        ? filtered
        : filtered.filter(item =>
          selectedRows.includes(item._id)
        );

    if (!exportRows.length) {
      alert("Please select at least one compliance.");
      return;
    }

    handleExportConfirm(exportRows);

    setShowExportSelection(false);
    setSelectedRows([]);
  }, [
    filtered,
    selectedRows,
    showExportSelection,
    handleExportConfirm
  ]);

  const getTag = (val) => val?.toLowerCase().replace(" ", "-");
  const isExpired = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="compliance-page">
      {showAddForm ? (
        <AddCompliance
        onCancel={() => setShowAddForm(false)}
        onSubmit={handleAddEditSubmit}
        initialData={editing}
        mode={editing ? "edit" : "add"}
        saved={saved}
        masterData={masterData}
        />
      ) : (
        <>
          <div className="header">
            <div>
              <h2>Compliance Management</h2>
              <p>Manage and track statutory compliance across all plants</p>
            </div>
          </div>

          {loading ? <Loader /> : (
            <>
              <div className="filter-box">
                <div className="filter-row" style={{ display: 'flex', flexFlow: 'row wrap' }}>
                  <input
                    placeholder="Search by ID, type, category, plant..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                  <select value={filterPlant} onChange={e => { setFilterPlant(e.target.value); setPage(1); }}>
                    <option value="">All Plants</option>
                    {plants?.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}>
                    <option value="">All Departments</option>
                    {depts?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    {['Open', 'Pending', 'Active', 'Inactive', 'Closed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select value={filterCompTyp} onChange={e => { setFilterCompTyp(e.target.value); setPage(1); }}>
                    <option value="">All Compliance Types</option>
                    {complianceTypes?.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </select>
                  <select value={filterCompCat} onChange={e => { setFilterCompCat(e.target.value); setPage(1); }}>
                    <option value="">All Compliance Categories</option>
                    {complianceCategories?.map(cc => <option key={cc} value={cc}>{cc}</option>)}
                  </select>
                  <select value={filterCompFreq} onChange={e => { setFilterCompFreq(e.target.value); setPage(1); }}>
                    <option value="">All Frequencies</option>
                    {complianceFrequencies?.map(cf => <option key={cf} value={cf}>{cf}</option>)}
                  </select>
                  <select value={filterCriticality} onChange={e => { setFilterCriticality(e.target.value); setPage(1); }}>
                    <option value="">All Criticalities</option>
                    {criticalities?.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                  </select>
                  <select value={filterPenaltyType} onChange={e => { setFilterPenaltyType(e.target.value); setPage(1); }}>
                    <option value="">All Penalty Types</option>
                    {penaltyTypes?.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                </div>
                <div className="filter-row second">
                  {(search || filterPlant || filterDept || filterStatus || filterApprovalStatus || filterCompTyp || filterCompCat || filterCompFreq || filterCriticality || filterPenaltyType) && (
                    <button className="light-btn" onClick={resetFilters}>
                      ✕ Clear Filters
                    </button>
                  )}
                  {/* {(user.acc_typ?.heirarchy > 2 && user.acc_plnt && user.acc_dept) && (
                    <button className="dark-btn" onClick={() => setShowAddForm(true)}>+ Add Compliance</button>
                  )} */}
                  <button className="dark-btn" onClick={() => setShowAddForm(true)}>+ Add Compliance</button>
                  <button
                    className="dark-btn"
                    onClick={handleExport}
                  >
                    {!showExportSelection
                      ? "Export"
                      : selectedRows.length === filtered.length
                        ? `Export All (${filtered.length})`
                        : `Export Selected (${selectedRows.length})`}
                  </button>
                </div>
              </div>

              <div className="table-box">
                <div className="table-box-scroll">
                  <table>
                    <thead>
                      <tr>
                        {showExportSelection && (
                          <th>
                            <input
                              type="checkbox"
                              checked={
                                filtered.length > 0 &&
                                selectedRows.length === filtered.length
                              }
                              onChange={handleSelectAll}
                            />
                          </th>
                        )}
                        <th>Compliance ID</th>
                        <th>Plant</th>
                        <th>Department</th>
                        <th>Due Date</th>
                        <th>Compliance Type</th>
                        <th>Category</th>
                        <th>Frequency</th>
                        <th>Criticality</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Approval Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={12} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>
                            No records found
                          </td>
                        </tr>
                      ) : paged.map((item) => (
                        <tr key={item._id} className={isExpired(item.dueDate) ? "row-expired" : ""}>
                          {showExportSelection && (
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(item._id)}
                                onChange={() =>
                                  handleSelectRow(item._id)
                                }
                              />
                            </td>
                          )}
                          <td className="link">{item.complianceId}</td>
                          <td>{item?.plant?.name}</td>
                          <td>{item?.department?.name}</td>
                          <td>{moment(item?.dueDate).format("DD-MM-YYYY")}</td>
                          <td>{item?.complianceType?.name}</td>
                          <td>{item?.complianceCategorization?.name}</td>
                          <td>{item?.complianceFrequency?.name}</td>
                          <td>
                            <span className={`tag ${getTag(item?.criticality?.name)}`}>
                              {item?.criticality?.name}
                            </span>
                          </td>
                          <td>
                            <select
                              className={`status ${getTag(item.status)}`}
                              value={item.status}
                              onChange={e => handleStatusChange(item.id, e.target.value)}
                              style={{ border: "none", cursor: "pointer", fontSize: "11px" }}
                            >
                              {['Open', 'Pending', 'Active', 'Inactive', 'Closed'].map(s => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {item.dueDate ? (
                              <span className={isExpired(item.dueDate) ? "due-date expired" : "due-date"}>
                                {new Date(item.dueDate).toLocaleDateString()}
                                {isExpired(item.dueDate) && <span className="expired-badge">Expired</span>}
                              </span>
                            ) : "—"}
                          </td>
                          <td>
                            <span className={`approval-badge approval-${getTag(item.approvalStatus)}`}>
                              {item.approvalStatus || "Pending"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              <button
                                onClick={() => handleEdit(item)}
                                className="action-icon-btn edit"
                                title="Edit"
                              ><EditNoteOutlinedIcon /></button>
                              <button
                                onClick={() => handleZipDownload(item.allDocs, item.complianceId)}
                                className="action-icon-btn zip"
                                title="ZIP Download"
                              ><FolderZipOutlinedIcon /></button>
                              <button
                                onClick={() => handleApprove(item)}
                                className="action-icon-btn approve"
                                disabled={!item.isApprover}
                                title="Approve"
                              ><DoneAllIcon /></button>
                              <button
                                onClick={() => handleReject(item)}
                                className="action-icon-btn reject"
                                disabled={!item.isApprover}
                                title="Reject"
                              ><CancelOutlinedIcon /></button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="action-icon-btn delete"
                                title="Delete"
                              ><DeleteSweepOutlinedIcon /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer">
                  <span>
                    Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                  </span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button className="light-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={page === i + 1 ? "dark-btn" : "light-btn"}
                        onClick={() => setPage(i + 1)}
                        style={{ padding: "6px 10px", minWidth: "32px" }}
                      >{i + 1}</button>
                    ))}
                    <button className="light-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
});

export default Compliance;
