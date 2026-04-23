import React, { useState, useEffect } from "react";
import "../styles/AddUser.css";
import axiosInstance from "../../config/axiosInstance";


const AddUser = ({ mode="add", onCancel, onSubmit, initialData, saved }) => {
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
    // console.log(mode);
    // console.log(initialData);
    if (initialData) {
      setForm({
        acc_uname: initialData?.acc_uname || "",
        acc_eml: initialData?.acc_eml || "",
        acc_phn: initialData?.acc_phn || "",
        acc_fname: initialData?.acc_fname || "",
        acc_secphn: initialData?.acc_secphn || "",
        acc_typ: initialData?.acc_typ?._id || null,
        acc_plnt: initialData?.acc_plnt?._id || null,
        acc_comp: initialData?.acc_comp || "",
        acc_dept: initialData?.acc_dept?._id || null,
        acc_desig: initialData?.acc_desig?._id || null,
        acc_emp_code: initialData?.acc_emp_code || "",
        acc_addrss: initialData?.acc_addrss || "",
        acc_pan: initialData?.acc_pan || "",
        acc_gst: initialData?.acc_gst || "",
        acc_dob: initialData?.acc_dob,
        acc_anniversary: initialData?.acc_anniversary
      })
    };
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
    // console.log(form);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      // console.log(`${key}:${value}`);
      if (value) formData.append(key, value);
    });
    onSubmit(formData);
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
            {
              mode === "add" && (
                <div className="form-group">
                  <label>Password *</label>
                  <input type={showPassword ? "text" : "password"} name="acc_pass" value={form.acc_pass} onChange={handleChange} placeholder="e.g. ********" />
                  <label className="checkbox" style={{display:'flex', padding:'0.5rem'}}>
                    <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                    <span style={{margin:'0 0 0 0.5rem'}}>Show Password</span>
                  </label>
                </div>
              )
            }
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
                {acctypes.map(a => <option key={a?._id} value={a?._id}>{a.typname}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Plant</label>
              <select name="acc_plnt" value={form.acc_plnt} onChange={handleChange}>
                <option value="">Select Plant</option>
                {plnts.map(p => <option key={p?._id} value={p?._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="acc_dept" value={form.acc_dept} onChange={handleChange}>
                <option value="">Select Department</option>
                {depts.map(d => <option key={d?._id} value={d?._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Address</h3>
          <div className="form-group full">
            <label>Details</label>
            <textarea name="acc_addrss" value={form.acc_addrss} onChange={handleChange} rows="4" />
          </div>
        </div>

        <div className="form-actions">
          <button className="light-btn" onClick={onCancel}>Cancel</button>
          {(saved && mode==='add') && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Created! Redirecting…</span>}
          {(saved && mode==='edit') && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Updated! Redirecting…</span>}
          <button className="dark-btn" onClick={handleSubmit}>{initialData ? "Update" : "Submit"}</button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
