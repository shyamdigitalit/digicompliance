import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Setting.css";

const getMasterKey = (type) => `master_${type}`;

const defaultData = {
  department: [
    { name: "Operations", code: "OPS", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Human Resources", code: "HR", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Quality", code: "QA", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Environment", code: "ENV", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  designation: [
    { name: "Plant Head", code: "PH", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Compliance Officer", code: "CO", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Safety Officer", code: "SO", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  plant: [
    { name: "Mumbai Plant A", code: "MUM-A", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Delhi Plant B", code: "DEL-B", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Bangalore Plant C", code: "BLR-C", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  criticality: [
    { name: "Critical", code: "CRIT", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "High", code: "HIGH", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Medium", code: "MED", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Low", code: "LOW", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  compliancetype: [
    { name: "Safety Inspection", code: "SI", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "ISO Audit", code: "ISO", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Labour Law", code: "LL", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Fire Safety", code: "FS", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  compliancecategory: [
    { name: "Health & Safety", code: "HS", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Quality Management", code: "QM", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Environmental", code: "ENV", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Statutory", code: "STAT", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  compliancefrequency: [
    { name: "Daily", code: "D", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Weekly", code: "W", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Monthly", code: "M", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Quarterly", code: "Q", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Annual", code: "A", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
  penaltytype: [
    { name: "Monetary Fine", code: "MF", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "License Revocation", code: "LR", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { name: "Warning Notice", code: "WN", status: "Active", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
  ],
};

const MasterList = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getMasterKey(type))) || defaultData[type] || [];
    } catch { return defaultData[type] || []; }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(getMasterKey(type)));
      setData(stored || defaultData[type] || []);
    } catch { setData(defaultData[type] || []); }
  }, [type]);

  useEffect(() => {
    localStorage.setItem(getMasterKey(type), JSON.stringify(data));
  }, [data, type]);

  const handleDelete = (idx) => {
    if (window.confirm("Delete this entry?")) {
      setData(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleToggleStatus = (idx) => {
    setData(prev => prev.map((item, i) => i === idx ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item));
  };

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="master-card">
      <div className="master-header">
        <div>
          <h3>{label}</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>{data.length} record{data.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="light-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="dark-btn" onClick={() => navigate(`/masters/${type}/add`)}>+ Add</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records yet. Click "+ Add" to create one.</td></tr>
          ) : data.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td style={{ fontFamily: "monospace", color: "#6b7280" }}>{item.code}</td>
              <td>
                <span
                  className={`tag ${item.status === "Active" ? "green" : "red-light"}`}
                  onClick={() => handleToggleStatus(i)}
                  style={{ cursor: "pointer" }}
                  title="Click to toggle"
                >{item.status}</span>
              </td>
              <td>{item.createdAt}</td>
              <td>{item.updatedAt}</td>
              <td>
                <button onClick={() => handleDelete(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterList;
