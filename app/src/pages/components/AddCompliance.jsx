import React, { useState } from "react";
import "../styles/AddCompliance.css";

const AddCompliance = ({ onCancel, onSubmit, masterData }) => {
  const [form, setForm] = useState({
    // complianceId: "",
    plant: "",
    department: "",
    complianceType: "",
    complianceCategorization: "",
    complianceFrequency: "",
    criticality: "",
    penaltyType: "",
    dueDate: "",
    legislation: "",
    complianceHeader: "",
    complianceDescription: "",
    complianceApplicability: "",
    additionalInformation: "",
    provision: "",
    complianceStatutoryAuthority: "",
    location: "",
    scheduledPeriodicity: "",
    remarks: "",
    allDocs: []
  });
  // const [saved, setSaved] = useState(null); // null = not attempted, true = success, false = failure

  const PLANTS = masterData.plants || [];
  const DEPARTMENTS = masterData.departments || [];
  const COMPLIANCE_TYPES = masterData.complianceTypes || [];
  const CATEGORIES = masterData.complianceCategories || [];
  const FREQUENCIES = masterData.complianceFrequencies || [];
  const CRITICALITIES = masterData.criticalities || [];
  const PENALTY_TYPES = masterData.penaltyTypes || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, allDocs: files }));
    // For preview purposes, you can create object URLs for the files
    // const filePreviews = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
    // setForm(prev => ({ ...prev, allDocs: filePreviews }));
  };

  const handleSubmit = () => {
    if (!form.plant || !form.department || !form.complianceType) {
      alert("Please fill required fields: Plant, Department, and Compliance Type");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "allDocs") {
        value.forEach(file => formData.append("allDocs", file));
      }
      else {
        formData.append(key, value);
      }
    });
    onSubmit(formData);
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
                {PLANTS.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Type *</label>
              <select name="complianceType" value={form.complianceType} onChange={handleChange}>
                <option value="">Select Type</option>
                {COMPLIANCE_TYPES.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Category</label>
              <select name="complianceCategorization" value={form.complianceCategorization} onChange={handleChange}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Frequency</label>
              <select name="complianceFrequency" value={form.complianceFrequency} onChange={handleChange}>
                <option value="">Select Frequency</option>
                {FREQUENCIES.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Criticality</label>
              <select name="criticality" value={form.criticality} onChange={handleChange}>
                <option value="">Select Criticality</option>
                {CRITICALITIES.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Penalty Type</label>
              <select name="penaltyType" value={form.penaltyType} onChange={handleChange}>
                <option value="">Select Penalty Type</option>
                {PENALTY_TYPES.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
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
            <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="4" />
          </div>
        </div>

        {/* FILE UPLOAD */}
        <div className="section">
          <h3>Documents</h3>
          <div className="upload-box">
            <input type="file" name="allDocs" multiple onChange={handleFiles} />
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