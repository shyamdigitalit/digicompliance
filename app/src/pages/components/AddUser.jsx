import React, { useState, useEffect } from "react";
import "../styles/AddUser.css";
import axiosInstance from "../../config/axiosInstance";

// const ROLES = ["Department Manager", "Plant Head", "Compliance Officer", "Quality Manager", "HR Manager", "Safety Officer", "Operations Manager", "Environment Manager"];
// const PLANTS = ["Mumbai Plant A", "Delhi Plant B", "Bangalore Plant C"];

const AddUser = ({ onCancel, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    username: "", name: "", email: "", role: "", plant: "", description: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acctypes, setAcctypes] = useState([]);
  const [plnts, setPlnts] = useState([]);
  const [depts, setDepts] = useState([]);

  const fetchMasterData = React.useCallback(async () => {
    try {
      const [accTypRes, plantRes, departmentRes] = await Promise.allSettled([
        axiosInstance.get("/api/acctyp/fetch"),
        axiosInstance.get("/api/plnt/fetch"),
        axiosInstance.get("/api/dept/fetch")
      ]);
      if (accTypRes.status === "fulfilled" && accTypRes.value.status === 200) {
        const accTyps = accTypRes.value.data?.data || [];
        setAcctypes(accTyps);
      }
      if (plantRes.status === "fulfilled" && plantRes.value.status === 200) {
        const plants = plantRes.value.data?.data || [];
        setPlnts(plants);
      }
      if (departmentRes.status === "fulfilled" && departmentRes.value.status === 200) {
        const depts = departmentRes.value.data?.data || [];
        setDepts(depts);
      }
    } catch (error) {
      console.error(error)
    }
  }, []);
  React.useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  useEffect(() => {
    if (initialData) setForm({ ...initialData, description: initialData.description || "" });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.acc_uname || !form.acc_fname || !form.acc_eml || !form.acc_typ) {
      alert("Please fill all required fields");
      return;
    }
    console.log(form);
    // onSubmit(form);
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
              <input type="text" name="acc_uname" value={form.acc_uname} onChange={handleChange} disabled={!!initialData} placeholder="e.g. jsmith" />
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="acc_fname" value={form.acc_fname} onChange={handleChange} placeholder="e.g. John Smith" />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type={showPassword ? "text" : "password"} name="acc_pass" value={form.acc_pass} onChange={handleChange} placeholder="e.g. ********" />
              <label className="checkbox" style={{margin:'0.5rem 0 0 0.2rem'}}>
                <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                Show Password
              </label>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="acc_eml" value={form.acc_eml} onChange={handleChange} placeholder="e.g. john@company.com" />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="text" name="acc_phn" value={form.acc_phn} onChange={handleChange} placeholder="e.g. 1234567890" />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select name="acc_typ" value={form.acc_typ} onChange={handleChange}>
                <option value="">Select Role</option>
                {acctypes.map(a => <option key={a?.id || a}>{a.typname}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Plant</label>
              <select name="acc_plnt" value={form.acc_plnt} onChange={handleChange}>
                <option value="">Select Plant</option>
                {plnts.map(p => <option key={p?.id || p}>{p.code}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="acc_dept" value={form.acc_dept} onChange={handleChange}>
                <option value="">Select Department</option>
                {depts.map(d => <option key={d?.id || d}>{d.name}</option>)}
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
