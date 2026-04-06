import React, { useState } from "react";
import "../styles/AddCompliance.css";

const PLANTS = ["Mumbai Plant A", "Delhi Plant B", "Bangalore Plant C"];
const DEPARTMENTS = ["Operations", "HR", "Quality", "Finance", "IT", "Environment", "Safety"];
const COMPLIANCE_TYPES = ["Safety Inspection", "ISO Audit", "Labour Law", "Fire Safety", "Pollution Control", "Product Testing", "Employee Training", "Waste Management"];
const CATEGORIES = ["Health & Safety", "Quality Management", "Statutory", "Environmental"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Annual"];
const CRITICALITIES = ["Critical", "High", "Medium", "Low"];
const PENALTY_TYPES = ["Monetary Fine", "License Revocation", "Warning Notice", "Prosecution"];

const AddCompliance = ({ onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    complianceId: "",
    plant: "",
    department: "",
    ComplianceType: "",
    complianceCategory: "",
    complianceFrequency: "",
    criticality: "",
    penaltyType: "",
    date: "",
    legislation: "",
    complianceHeader: "",
    complianceDescription: "",
    complianceApplicability: "",
    additionalInformation: "",
    provision: "",
    complianceStatutoryAuthority: "",
    location: "",
    scheduledPeriodicity: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.plant || !form.department || !form.ComplianceType) {
      alert("Please fill required fields: Plant, Department, and Compliance Type");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="add-page">
      <div className="header">
        <div>
          <h2>Add Compliance</h2>
          <p>Create and manage compliance records</p>
        </div>
      </div>

      <div className="form-card">
        {/* SECTION 1 */}
        <div className="section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Plant *</label>
              <select name="plant" value={form.plant} onChange={handleChange}>
                <option value="">Select Plant</option>
                {PLANTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Type *</label>
              <select name="ComplianceType" value={form.ComplianceType} onChange={handleChange}>
                <option value="">Select Type</option>
                {COMPLIANCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Category</label>
              <select name="complianceCategory" value={form.complianceCategory} onChange={handleChange}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Frequency</label>
              <select name="complianceFrequency" value={form.complianceFrequency} onChange={handleChange}>
                <option value="">Select Frequency</option>
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Criticality</label>
              <select name="criticality" value={form.criticality} onChange={handleChange}>
                <option value="">Select Criticality</option>
                {CRITICALITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Penalty Type</label>
              <select name="penaltyType" value={form.penaltyType} onChange={handleChange}>
                <option value="">Select Penalty Type</option>
                {PENALTY_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Legislation</label>
              <input name="legislation" value={form.legislation} onChange={handleChange} placeholder="e.g. Factories Act 1948" />
            </div>
            <div className="form-group">
              <label>Compliance Header</label>
              <input name="complianceHeader" value={form.complianceHeader} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Compliance Description</label>
              <input name="complianceDescription" value={form.complianceDescription} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Compliance Applicability</label>
              <input name="complianceApplicability" value={form.complianceApplicability} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Additional Information</label>
              <input name="additionalInformation" value={form.additionalInformation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Provision</label>
              <input name="provision" value={form.provision} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Statutory Authority</label>
              <input name="complianceStatutoryAuthority" value={form.complianceStatutoryAuthority} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Scheduled Periodicity</label>
              <input name="scheduledPeriodicity" value={form.scheduledPeriodicity} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="section">
          <h3>Remarks</h3>
          <div className="form-group full">
            <label>Details</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </div>
        </div>

        {/* FILE UPLOAD */}
        <div className="section">
          <h3>Documents</h3>
          <div className="upload-box">
            <input type="file" multiple />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button className="light-btn" onClick={onCancel}>Cancel</button>
          <button className="dark-btn" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default AddCompliance;