import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import axiosInstance from "../../config/axiosInstance";

// const getMasterKey = (type) => `master_${type}`;

const MasterList = () => {
  const { type } = useParams();
  console.log(type);
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [saved, setSaved] = useState(false);
  
  const fetchMasterData = useCallback(async () => {
    let apiType = "";
    switch (type) {
      case "Account Type": apiType = "acctyp"; break;
      case "plant": apiType = "plnt"; break;
      case "department": apiType = "dept"; break;
      case "company": apiType = "cmpny"; break;
      case "designation": apiType = "desig"; break;
      case "compliancetype": apiType = "comptyp"; break;
      case "compliancecategory": apiType = "compcateg"; break;
      case "compliancefrequency": apiType = "compfreq"; break;
      case "criticality": apiType = "criticlty"; break;
      case "penaltytype": apiType = "penlty"; break;
    }

    try {
      const response = await axiosInstance.get(`/api/${apiType==="acctyp" ? "acctyp/fetchuppr" : `${apiType}/fetch`}`);
      setData(response.data?.data || []);
    } catch (error) {
      console.error(error)
    }
  }, [type]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const handleDelete = async (idx) => {
    if (window.confirm("Delete this entry?")) {
      let apiType = "";
      switch (type) {
        case "Account Type": apiType = "acctyp"; break;
        case "plant": apiType = "plnt"; break;
        case "department": apiType = "dept"; break;
        case "company": apiType = "cmpny"; break;
        case "designation": apiType = "desig"; break;
        case "compliancetype": apiType = "comptyp"; break;
        case "compliancecategory": apiType = "compcateg"; break;
        case "compliancefrequency": apiType = "compfreq"; break;
        case "criticality": apiType = "criticlty"; break;
        case "penaltytype": apiType = "penlty"; break;
      }
      const response = await axiosInstance.delete(`/api/${apiType}/delete?id=${data[idx]._id}`);
      if (response.status === 200) {
        setSaved(true);
        setTimeout(() => {
          setData(prev => prev.filter((_, i) => i !== idx));
          setSaved(false);
        }, 1000);
      }
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
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Removed! Reloading…</span>}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="light-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="dark-btn" onClick={() => navigate(`/masters/${type}/add`)}>+ Add</button>
        </div>
      </div>

      {
        type === "Account Type" ? (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Heirarchy</th>
                <th>Same Level</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records yet. Click "+ Add" to create one.</td></tr>
              ) : data?.map((item, i) => (
                <tr key={i}>
                  <td>{item.typname}</td>
                  <td>{item.heirarchy}</td>
                  <td>{String(item.stacklvl)}</td>
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
        ) : (
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
              {data?.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records yet. Click "+ Add" to create one.</td></tr>
              ) : data?.map((item, i) => (
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
        )
      }      
    </div>
  );
};

export default MasterList;
