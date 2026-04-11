import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import axiosInstance from "../../config/axiosInstance";

// const getMasterKey = (type) => `master_${type}`;

const MasterForm = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", code: "", desc: "" });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    let newEntry = {}, apiType = "";
    if (type === "Account Type") {
      if (!form.typname.trim() || !form.heirarchy) {
        alert("Please fill in both Type and Heirarchy");
        return;
      }
      Object.assign(newEntry, {
        typname: form.typname.trim(),
        heirarchy: Number(form.heirarchy || 0),
        stacklvl: form.stacklvl === "true",
        status: "Active"
      });
      apiType = "acctyp"
    }
    else {
      if (!form.name.trim() || !form.code.trim()) {
        alert("Please fill in both Name and Code");
        return;
      }
      Object.assign(newEntry, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        desc: form.desc?.trim() || "",
        status: "Active"
      });

      switch (type) {
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
    }

    try {
      const response = await axiosInstance.post(`/api/${apiType}/create`, newEntry);
      if (response.status === 201) {
        setSaved(true);
        setTimeout(() => navigate(-1), 1000);
      } else {
        setTimeout(() => setSaved(false), 1000);
        // alert("Failed to save entry. Please try again.");
        return;
      }
    } catch (error) {
      console.error(error)
    }
  };

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  if (type === "Account Type") {
    return (
      <div className="master-card">
        <div className="master-header">
          <h3>Add {label}</h3>
          <button className="light-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="master-form" style={{ flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label>Type *</label>
            <input name="typname" value={form.typname} onChange={handleChange} placeholder={`Enter ${label} name`} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label>Heirarchy *</label>
            <input name="heirarchy" value={String(form.heirarchy).match(/(\d+)/)?.[1] || ""} onChange={handleChange} placeholder="Heirarchy Level" />
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "4px" }}>
            <label>Same Level *&nbsp;</label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" name="stacklvl" value="true" onChange={handleChange} />
              Yes
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" name="stacklvl" value="false" onChange={handleChange} />
              No
            </label>
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="dark-btn" onClick={handleSave}>Save</button>
          <button className="light-btn" onClick={() => navigate(-1)}>Cancel</button>
          {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Saved! Redirecting…</span>}
        </div>
      </div>
    );
  }
  else {
    return (
      <div className="master-card">
        <div className="master-header">
          <h3>Add {label}</h3>
          <button className="light-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="master-form" style={{ flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder={`Enter ${label} name`} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label>Code *</label>
            <input name="code" value={form.code} onChange={handleChange} placeholder="Short code (e.g. OPS)" style={{ textTransform: "uppercase" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label>Description</label>
            <textarea name="desc" value={form.desc} onChange={handleChange} rows="4" />
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="dark-btn" onClick={handleSave}>Save</button>
          <button className="light-btn" onClick={() => navigate(-1)}>Cancel</button>
          {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Saved! Redirecting…</span>}
        </div>
      </div>
    );
  }
};

export default MasterForm;