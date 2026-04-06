import React, { useState, useEffect } from "react";
import "../styles/AddUser.css";

const ROLES = ["Department Manager", "Plant Head", "Compliance Officer", "Quality Manager", "HR Manager", "Safety Officer", "Operations Manager", "Environment Manager"];
const PLANTS = ["Mumbai Plant A", "Delhi Plant B", "Bangalore Plant C"];

const AddUser = ({ onCancel, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    username: "", name: "", email: "", role: "", plant: "", description: ""
  });

  useEffect(() => {
    if (initialData) setForm({ ...initialData, description: initialData.description || "" });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.username || !form.name || !form.email || !form.role || !form.plant) {
      alert("Please fill all required fields");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="add-page">
      <div className="header">
        <div>
          <h2>{initialData ? "Edit User" : "Add User"}</h2>
          <p>Create and manage users</p>
        </div>
      </div>

      <div className="form-card">
        <div className="section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Username *</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} disabled={!!initialData} placeholder="e.g. jsmith" />
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Smith" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. john@company.com" />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Select Role</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Plant *</label>
              <select name="plant" value={form.plant} onChange={handleChange}>
                <option value="">Select Plant</option>
                {PLANTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Remarks</h3>
          <div className="form-group full">
            <label>Details</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </div>
        </div>

        <div className="form-actions">
          <button className="light-btn" onClick={onCancel}>Cancel</button>
          <button className="dark-btn" onClick={handleSubmit}>{initialData ? "Update" : "Submit"}</button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
