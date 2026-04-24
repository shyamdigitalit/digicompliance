import React, { useState, useMemo, useEffect } from "react";
import AddCompliance from "./AddCompliance";
import "../styles/Compliance.css";
import axiosInstance from "../../config/axiosInstance";
import { useCallback } from "react";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import FolderZipIcon from '@mui/icons-material/FolderZip';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const COMPLIANCE_KEY = "compliance_data";
const ACTIVITY_KEY = "activity_log";

const PAGE_SIZE = 8;

const Compliance = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [masterData, setMasterData] = useState({
    plants: [],
    departments: [],
    complianceTypes: [],
    complianceCategories: [],
    complianceFrequencies: [],
    criticalities: [],
    penaltyTypes: []
  });
  const [data, setData] = useState([]);
  const [saved, setSaved] = useState(false);

  const user = useSelector(state => state.auth.user) || {};

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/comp/fetch");
      setData(response.data?.data || []);
    } catch (error) {
      console.error(error)
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const fetchMasterData = useCallback(async () => {
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
      // console.log(plantsRes.value?.data?.data);
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
      console.error(error)
    }
  }, []);
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const [search, setSearch] = useState("");
  const [filterPlant, setFilterPlant] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCompTyp, setFilterCompTyp] = useState("");
  const [filterCompCat, setFilterCompCat] = useState("");
  const [filterCompFreq, setFilterCompFreq] = useState("");
  const [filterCriticality, setFilterCriticality] = useState("");
  const [filterPenaltyType, setFilterPenaltyType] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(data));
  }, [data]);

  const plants = useMemo(() => [...new Set(data?.map(d => d.plant?.name || ""))], [data]);
  const depts = useMemo(() => [...new Set(data?.map(d => d.department?.name || ""))], [data]);
  const complianceTypes = useMemo(() => [...new Set(data?.map(d => d.complianceType?.name || ""))], [data]);
  const complianceCategories = useMemo(() => [...new Set(data?.map(d => d.complianceCategorization?.name || ""))], [data]);
  const complianceFrequencies = useMemo(() => [...new Set(data?.map(d => d.complianceFrequency?.name || ""))], [data]);
  const criticalities = useMemo(() => [...new Set(data?.map(d => d.criticality?.name || ""))], [data]);
  const penaltyTypes = useMemo(() => [...new Set(data?.map(d => d.penaltyType?.name || ""))], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data?.filter(item => {
      const matchSearch = !q || item.complianceId.toLowerCase().includes(q) || item.complianceType.toLowerCase().includes(q) || item.complianceCategorization.toLowerCase().includes(q) || item.plant.toLowerCase().includes(q);
      const matchPlant = !filterPlant || item.plant === filterPlant;
      const matchDept = !filterDept || item.department === filterDept;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchCompTyp = !filterCompTyp || item.complianceType === filterCompTyp;
      const matchCompCat = !filterCompCat || item.complianceCategorization === filterCompCat;
      const matchCompFreq = !filterCompFreq || item.complianceFrequency === filterCompFreq;
      const matchCriticality = !filterCriticality || item.criticality === filterCriticality;
      const matchPenaltyType = !filterPenaltyType || item.penaltyType === filterPenaltyType;
      return matchSearch && matchPlant && matchDept && matchStatus && matchCompTyp && matchCompCat && matchCompFreq && matchCriticality && matchPenaltyType;
    });
  }, [data, search, filterPlant, filterDept, filterStatus, filterCompTyp, filterCompCat, filterCompFreq, filterCriticality, filterPenaltyType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddEditSubmit = async (formData) => {
    try {
      if (editing) {
        const response = await axiosInstance.patch(`/api/comp/update?id=${editing?._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (response.status === 201) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false)
            setShowAddForm(false);
            fetchData();
          }, 1000);
        } else {
          // setTimeout(() => setSaved(false), 1000);
          alert("Failed to add compliance. Please try again.");
        }
      }
      else {
        const response = await axiosInstance.post("/api/comp/create", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (response.status === 201) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false)
            setShowAddForm(false);
            fetchData();
          }, 1000);
        } else {
          // setTimeout(() => setSaved(false), 1000);
          alert("Failed to add compliance. Please try again.");
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setShowAddForm(true);
  };

  const handleZipDownload = async (value = [], label = "Compliance_Files") => {
    if (!value || value.length === 0) {
      // dispatch(showSnackbar({
      //   message: 'No files available for download!',
      //   severity: 'warning'
      // }));
      alert(`No files available for download!`)
      return;
    }

    try {

      const backendFiles = value.filter(f => f.filId);
      const localFiles = value.filter(f => f instanceof File);
      const urlFiles = value.filter(f => f.filUrl && !f.filId);

      // Backend ZIP download
      if (backendFiles.length > 0) {

        try {

          const fileIds = backendFiles.map(f => f.filId).join(',');

          const response = await axiosInstance.get(
            `/api/file/downloadall?files=${fileIds}`,
            { responseType: 'blob' }
          );

          const blob = new Blob([response.data], {
            type: 'application/zip'
          });

          saveAs(blob, `${label}.zip`);

          // dispatch(showSnackbar({
          //   message: 'Files downloaded successfully!',
          //   severity: 'success'
          // }));
          alert(`Files downloaded successfully!`)

          return;

        } catch (err) {

          // dispatch(showSnackbar({
          //   message: 'Backend ZIP failed, trying fallback.',
          //   severity: 'warning'
          // }));
          console.log(err);
          alert(`Backend ZIP failed, trying fallback.`)
        }
      }

      // Fallback ZIP creation
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

      // dispatch(showSnackbar({
      //   message: 'ZIP exported successfully!',
      //   severity: 'success'
      // }));
      alert(`ZIP exported successfully!`)

    }
    catch (err) {

      console.error(err);

      // dispatch(showSnackbar({
      //   message: 'ZIP download failed.',
      //   severity: 'error'
      // }));
      alert(`ZIP download failed.`)
    }
  };

  const handleApprove = async (row) => {
    try {
      if (window.confirm("Approve this compliance record?")) {
        // setData(prev => prev.filter(d => d.id !== id));
        const response = await axiosInstance.patch(`/api/comp/approve?id=${row._id}&flg=1`, row)
        if (response.status === 201) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false)
            setShowAddForm(false);
            fetchData();
          }, 1000);
        }
        else {
          alert(`Approval Failed`)
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleReject = async (row) => {
    try {
      if (window.confirm("Reject this compliance record?")) {
        // setData(prev => prev.filter(d => d.id !== id));
        const response = await axiosInstance.patch(`/api/comp/approve?id=${row._id}&flg=0`, row)
        if (response.status === 201) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false)
            setShowAddForm(false);
            fetchData();
          }, 1000);
        }
        else {
          alert(`Rejection Failed`)
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Delete this compliance record?")) {
        // setData(prev => prev.filter(d => d._id !== id));
        const response = await axiosInstance.delete(`/api/comp/delete?id=${id}`)
        if (response.status === 200) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false)
            fetchData();
          }, 1000);
        }
        else {
          alert(`Deletion Failed`)
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setData(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
  };

  const handleExport = () => {
    let exportData = [];
    if (!paged.length) {
      // dispatch(showSnackbar({ message: 'No data available to export.', severity: 'warning' }));
      alert('No data available to export.')
      return;
    }
    else {
      console.log(paged);
      alert('Exporting data...')
      exportData = paged?.map(({
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
        // ...rest,
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
      console.log(exportData);

      // ✅ Convert JSON → Worksheet (ALL columns automatically)
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      // ✅ Create Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Compliance');
      // ✅ Export file
      XLSX.writeFile(workbook, 'Compliance_Datasheet.xlsx');
    }
  };

  const getTag = (val) => val?.toLowerCase().replace(" ", "-");

  const resetFilters = () => {
    setSearch(""); setFilterPlant(""); setFilterDept(""); setFilterStatus(""); setFilterCriticality(""); setPage(1);
  };

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

          <div className="filter-box">
            <div className="filter-row" style={{ display: 'flex', flexFlow: 'row wrap'}}>
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
                <button className="light-btn" onClick={resetFilters}>✕ Clear Filters</button>
              )}
              {(user.acc_typ?.heirarchy>2 && user.acc_plnt && user.acc_dept) && <button className="dark-btn" onClick={() => setShowAddForm(true)}>+ Add Compliance</button>}
              {(user.acc_typ?.heirarchy<=2 && (user.acc_plnt || user.acc_dept)) && <button className="dark-btn" onClick={() => setShowAddForm(true)}>+ Add Compliance</button>}
              <button className="light-btn" onClick={handleExport}>Export</button>
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
                  <th>Compliance Type</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Criticality</th>
                  <th>Status</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records found</td></tr>
                ) : paged.map((item) => (
                  <tr key={item._id}>
                    <td className="link">{item.complianceId}</td>
                    <td>{item?.plant?.name}</td>
                    <td>{item?.department?.name}</td>
                    <td>{item?.complianceType?.name}</td>
                    <td>{item?.complianceCategorization?.name}</td>
                    <td>{item?.complianceFrequency?.name}</td>
                    {/* <td>{item?.criticality?.name}</td> */}
                    <td><span className={`tag ${getTag(item?.criticality?.name)}`}>{item?.criticality?.name}</span></td>
                    <td>
                      <select
                        className={`status ${getTag(item.status)}`}
                        value={item.status}
                        onChange={e => handleStatusChange(item.id, e.target.value)}
                        style={{ border: "none", cursor: "pointer", fontSize: "11px" }}
                      >
                        {['Open', 'Pending', 'Active', 'Inactive', 'Closed'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{item.approvalStatus}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} style={{ background: "none", padding: "0.5rem", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "15px" }} title="Edit">✏</button>
                      <button onClick={() => handleZipDownload(item.allDocs, item.complianceId)} style={{ background: "none", padding: "0.5rem", border: "none", cursor: "pointer", color: "#e525eb", fontSize: "5px" }} title="ZIP Download"><FolderZipIcon /></button>
                      <button onClick={() => handleApprove(item)} style={{ background: "none", padding: "0.5rem", border: "none", cursor: "pointer", color: "#11bd2e", fontSize: "16px" }} disabled={!item.isApprover} title="Approve">✓</button>
                      <button onClick={() => handleReject(item)} style={{ background: "none", padding: "0.5rem", border: "none", cursor: "pointer", color: "#bd6d11", fontSize: "16px" }} disabled={!item.isApprover} title="Reject">!</button>
                      <button onClick={() => handleDelete(item._id)} style={{ background: "none", padding: "0.5rem", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px" }} title="Delete">🗑</button>
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
    </div>
  );
};

export default Compliance;