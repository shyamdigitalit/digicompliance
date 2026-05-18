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
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Loader from "../../components/loader";
import moment from 'moment';
import { logActivity } from "../utils/activityLog";

const COMPLIANCE_KEY = "compliance_data";
const ACTIVITY_KEY = "activity_log";

const PAGE_SIZE = 8;

const Compliance = React.memo(function Compliance() {
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

  const user = useSelector(state => state.auth.user) || {};

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
  const [filterCompTyp, setFilterCompTyp] = React.useState("");
  const [filterCompCat, setFilterCompCat] = React.useState("");
  const [filterCompFreq, setFilterCompFreq] = React.useState("");
  const [filterCriticality, setFilterCriticality] = React.useState("");
  const [filterPenaltyType, setFilterPenaltyType] = React.useState("");
  const [page, setPage] = React.useState(1);

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
    // console.log(search);
    const q = search.toLowerCase();
    return data?.filter(item => {
      const matchSearch = !q || item.complianceId.toLowerCase().includes(q) || item.complianceType.toLowerCase().includes(q) || item.complianceCategorization.toLowerCase().includes(q) || item.plant.toLowerCase().includes(q);
      const matchPlant = !filterPlant || item.plant.name === filterPlant;
      const matchDept = !filterDept || item.department.name === filterDept;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchCompTyp = !filterCompTyp || item.complianceType.name === filterCompTyp;
      const matchCompCat = !filterCompCat || item.complianceCategorization.name === filterCompCat;
      const matchCompFreq = !filterCompFreq || item.complianceFrequency.name === filterCompFreq;
      const matchCriticality = !filterCriticality || item.criticality.name === filterCriticality;
      const matchPenaltyType = !filterPenaltyType || item.penaltyType.name === filterPenaltyType;
      return matchSearch && matchPlant && matchDept && matchStatus && matchCompTyp && matchCompCat && matchCompFreq && matchCriticality && matchPenaltyType;
    });
  }, [data, search, filterPlant, filterDept, filterStatus, filterCompTyp, filterCompCat, filterCompFreq, filterCriticality, filterPenaltyType]);

  const resetFilters = React.useCallback(() => {
    setSearch('');
    setFilterPlant('');
    setFilterDept('');
    setFilterStatus('');
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
  }, [editing, setSaved, setShowAddForm, fetchData]);

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
        if (response.status === 200) {
          logActivity("Compliance Deleted", id, user);
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
  }, [setSaved, fetchData]);

  const handleStatusChange = React.useCallback((id, newStatus) => {
    setData(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
    logActivity("Compliance Status Changed", `Status set to ${newStatus}`, user);
  }, [user]);

  const handleExport = React.useCallback(() => {
    if (!paged.length) {
      alert('No data available to export.');
      return;
    }
    alert('Exporting data...');
    const exportData = paged?.map(({
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
      allDocs,
      approvalDetails,
      createdAt,
      updatedAt,
      createdby,
      updatedby,
      __v,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Compliance');
    XLSX.writeFile(workbook, 'Compliance_Datasheet.xlsx');
    logActivity("Compliance Exported", `${exportData.length} records`, user);
  }, [paged, user]);

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
                  {(search || filterPlant || filterDept || filterStatus || filterCompTyp || filterCompCat || filterCompFreq || filterCriticality || filterPenaltyType) && (
                    <button className="light-btn" onClick={resetFilters}>
                      ✕ Clear Filters
                    </button>
                  )}
                  {(user.acc_typ?.heirarchy > 2 && user.acc_plnt && user.acc_dept) && (
                    <button className="dark-btn" onClick={() => setShowAddForm(true)}>+ Add Compliance</button>
                  )}
                  <button className="dark-btn" onClick={handleExport}>Export</button>
                </div>
              </div>

              <div className="table-box">
                <div className="table-box-scroll">
                  <table>
                    <thead>
                      <tr>
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
                          <td colSpan={9} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>
                            No records found
                          </td>
                        </tr>
                      ) : paged.map((item) => (
                        <tr key={item._id} className={isExpired(item.dueDate) ? "row-expired" : ""}>
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
