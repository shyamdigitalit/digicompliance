import React, { useState, useMemo, useEffect } from "react";
import AddCompliance from "./AddCompliance";
import "../styles/Compliance.css";
import axiosInstance from "../../config/axiosInstance";
import { useCallback } from "react";

const COMPLIANCE_KEY = "compliance_data";
const ACTIVITY_KEY = "activity_log";

// const defaultData = [
//   { id: "CMP-001", plant: "Mumbai Plant A", dept: "Operations", type: "Safety Inspection", category: "Health & Safety", freq: "Monthly", criticality: "High", status: "Completed", dueDate: "2026-04-11" },
//   { id: "CMP-002", plant: "Delhi Plant B", dept: "Quality", type: "ISO Audit", category: "Quality Management", freq: "Quarterly", criticality: "Critical", status: "Pending", dueDate: "2026-04-14" },
//   { id: "CMP-003", plant: "Mumbai Plant A", dept: "HR", type: "Labour Law", category: "Statutory", freq: "Annual", criticality: "Medium", status: "In Progress", dueDate: "2026-04-19" },
//   { id: "CMP-004", plant: "Bangalore Plant C", dept: "Environment", type: "Pollution Control", category: "Environmental", freq: "Monthly", criticality: "Critical", status: "Overdue", dueDate: "2026-04-10" },
//   { id: "CMP-005", plant: "Delhi Plant B", dept: "Operations", type: "Fire Safety", category: "Health & Safety", freq: "Weekly", criticality: "High", status: "Completed", dueDate: "2026-04-21" },
//   { id: "CMP-006", plant: "Bangalore Plant C", dept: "Quality", type: "Product Testing", category: "Quality Management", freq: "Daily", criticality: "Medium", status: "In Progress", dueDate: "2026-04-17" },
//   { id: "CMP-007", plant: "Mumbai Plant A", dept: "HR", type: "Employee Training", category: "Statutory", freq: "Quarterly", criticality: "Low", status: "Pending", dueDate: "2026-04-23" },
//   { id: "CMP-008", plant: "Delhi Plant B", dept: "Environment", type: "Waste Management", category: "Environmental", freq: "Monthly", criticality: "High", status: "Completed", dueDate: "2026-04-26" },
// ];

const PAGE_SIZE = 8;

const Compliance = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [data, setData] = useState([]);
  // const [data, setData] = useState(() => {
  //   try { return JSON.parse(localStorage.getItem(COMPLIANCE_KEY)) || defaultData; }
  //   catch { return defaultData; }
  // });

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
  }, [fetchData])

  const [search, setSearch] = useState("");
  const [filterPlant, setFilterPlant] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCriticality, setFilterCriticality] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(data));
  }, [data]);

  const plants = useMemo(() => [...new Set(data.map(d => d.plant))], [data]);
  const depts = useMemo(() => [...new Set(data.map(d => d.department))], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(item => {
      const matchSearch = !q || item.id.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.plant.toLowerCase().includes(q);
      const matchPlant = !filterPlant || item.plant === filterPlant;
      const matchDept = !filterDept || item.dept === filterDept;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchCrit = !filterCriticality || item.criticality === filterCriticality;
      return matchSearch && matchPlant && matchDept && matchStatus && matchCrit;
    });
  }, [data, search, filterPlant, filterDept, filterStatus, filterCriticality]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddSubmit = (formData) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const newItem = {
      id: `CMP-${String(data.length + 1).padStart(3, "0")}`,
      plant: formData.plant,
      dept: formData.department,
      type: formData.ComplianceType,
      category: formData.complianceCategory,
      freq: formData.complianceFrequency,
      criticality: formData.criticality,
      status: "Pending",
      dueDate: formData.date || "",
    };
    const updated = [...data, newItem];
    setData(updated);

    // Log activity
    const activities = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];
    activities.unshift({ text: `Added ${newItem.type} - ${newItem.plant}`, user: user.name || "Admin", time: "Just now" });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, 20)));

    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this compliance record?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const getTag = (val) => val.toLowerCase().replace(" ", "-");

  const resetFilters = () => {
    setSearch(""); setFilterPlant(""); setFilterDept(""); setFilterStatus(""); setFilterCriticality(""); setPage(1);
  };

  return (
    <div className="compliance-page">
      {showAddForm ? (
        <AddCompliance onCancel={() => setShowAddForm(false)} onSubmit={handleAddSubmit} />
      ) : (
        <>
          <div className="header">
            <div>
              <h2>Compliance Management</h2>
              <p>Manage and track statutory compliance across all plants</p>
            </div>
          </div>

          <div className="filter-box">
            <div className="filter-row">
              <input
                placeholder="Search by ID, type, category, plant..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              <select value={filterPlant} onChange={e => { setFilterPlant(e.target.value); setPage(1); }}>
                <option value="">All Plants</option>
                {plants.map(p => <option key={p}>{p}</option>)}
              </select>
              <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}>
                <option value="">All Departments</option>
                {depts.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                {["Completed", "Pending", "In Progress", "Overdue"].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterCriticality} onChange={e => { setFilterCriticality(e.target.value); setPage(1); }}>
                <option value="">All Criticality</option>
                {["Critical", "High", "Medium", "Low"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-row second">
              {(search || filterPlant || filterDept || filterStatus || filterCriticality) && (
                <button className="light-btn" onClick={resetFilters}>✕ Clear Filters</button>
              )}
              <button className="add-btn" onClick={() => setShowAddForm(true)}>+ Add Compliance</button>
            </div>
          </div>

          <div className="table-box">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records found</td></tr>
                ) : paged.map((item, i) => (
                  <tr key={item.id}>
                    <td className="link">{item.id}</td>
                    <td>{item.plant}</td>
                    <td>{item.dept}</td>
                    <td>{item.type}</td>
                    <td>{item.category}</td>
                    <td>{item.freq}</td>
                    <td><span className={`tag ${getTag(item.criticality)}`}>{item.criticality}</span></td>
                    <td>
                      <select
                        className={`status ${getTag(item.status)}`}
                        value={item.status}
                        onChange={e => handleStatusChange(item.id, e.target.value)}
                        style={{ border: "none", cursor: "pointer", fontSize: "11px" }}
                      >
                        {["Completed", "Pending", "In Progress", "Overdue"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px" }} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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