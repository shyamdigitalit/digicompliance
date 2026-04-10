import React, { useState, useMemo, useEffect, useCallback } from "react";
import "../styles/User.css";
import AddUser from "./AddUser";
import axiosInstance from "../../config/axiosInstance";

const USER_KEY = "user_data";

// const defaultData = [
//   { username: "jsmith", name: "John Smith", email: "john.smith@company.com", role: "Department Manager", plant: "Mumbai Plant A" },
//   { username: "sjohnson", name: "Sarah Johnson", email: "sarah.johnson@company.com", role: "Plant Head", plant: "Delhi Plant B" },
//   { username: "mchen", name: "Michael Chen", email: "michael.chen@company.com", role: "Compliance Officer", plant: "Mumbai Plant A" },
//   { username: "edavis", name: "Emily Davis", email: "emily.davis@company.com", role: "Quality Manager", plant: "Bangalore Plant C" },
//   { username: "rwilson", name: "Robert Wilson", email: "robert.wilson@company.com", role: "HR Manager", plant: "Delhi Plant B" },
//   { username: "lbrown", name: "Lisa Brown", email: "lisa.brown@company.com", role: "Safety Officer", plant: "Mumbai Plant A" },
//   { username: "dgarcia", name: "David Garcia", email: "david.garcia@company.com", role: "Operations Manager", plant: "Bangalore Plant C" },
//   { username: "amartin", name: "Anna Martin", email: "anna.martin@company.com", role: "Environment Manager", plant: "Delhi Plant B" },
// ];

const PAGE_SIZE = 10;

const Users = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterPlant, setFilterPlant] = useState("");
  const [page, setPage] = useState(1);

  const getAllUserData = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/acc/fetch");
      if (response?.status === 202) {
        console.log(response.data?.data?.Acc);
        setData(response.data?.data?.Acc);
      }
      else {
        setData([]);
      }
    } catch (error) {
      console.error(error)
    }
  }, []);

  useEffect(() => {
    getAllUserData();
  }, [getAllUserData]);

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }, [data]);

  const roles = useMemo(() => [...new Set(data?.map(d => d.role))], [data]);
  const plants = useMemo(() => [...new Set(data?.map(d => d.plant))], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data?.filter(u => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = !filterRole || u.role === filterRole;
      const matchPlant = !filterPlant || u.plant === filterPlant;
      return matchSearch && matchRole && matchPlant;
    });
  }, [data, search, filterRole, filterPlant]);

  const totalPages = Math.ceil(filtered?.length / PAGE_SIZE);
  const paged = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getRoleClass = (role) => {
    if (role?.includes("Manager")) return "tag blue";
    if (role?.includes("Head")) return "tag purple";
    if (role?.includes("Officer")) return "tag green";
    return "tag orange";
  };

  const handleAddSubmit = (formData) => {
    if (editingUser) {
      setData(prev => prev.map(u => u.username === editingUser.username ? { ...u, ...formData } : u));
      setEditingUser(null);
    } else {
      setData(prev => [...prev, { username: formData.username, name: formData.name, email: formData.email, role: formData.role, plant: formData.plant }]);
    }
    setShowAddForm(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowAddForm(true);
  };

  const handleDelete = (username) => {
    if (window.confirm("Delete this user?")) {
      setData(prev => prev.filter(u => u.username !== username));
    }
  };

  const resetFilters = () => { setSearch(""); setFilterRole(""); setFilterPlant(""); setPage(1); };

  return (
    <>
      {showAddForm ? (
        <AddUser
          onCancel={() => { setShowAddForm(false); setEditingUser(null); }}
          onSubmit={handleAddSubmit}
          initialData={editingUser}
        />
      ) : (
        <>
          <div className="user-header">
            <h2>User Management</h2>
            <p>Manage users and their access to the compliance system</p>
          </div>

          <div className="user-filters">
            <input
              placeholder="Search by name, username or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
            <select value={filterPlant} onChange={e => { setFilterPlant(e.target.value); setPage(1); }}>
              <option value="">All Plants</option>
              {plants.map(p => <option key={p}>{p}</option>)}
            </select>
            {(search || filterRole || filterPlant) && (
              <button className="light-btn" onClick={resetFilters}>✕ Clear</button>
            )}
            <button className="add-btn" onClick={() => { setEditingUser(null); setShowAddForm(true); }}>+ Add User</button>
          </div>

          <div className="user-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plant</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No users found</td></tr>
                ) : paged?.map((user, i) => (
                  <tr key={i}>
                    <td className="link">{user.acc_uname}</td>
                    <td>{user.acc_fname}</td>
                    <td>{user.acc_eml}</td>
                    <td><span className={getRoleClass(user.acc_typ?.typname)}>{user.acc_typ?.typname}</span></td>
                    <td>{user.acc_plnt?.plantName}</td>
                    <td>{user.acc_dept?.departmentName}</td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleEdit(user)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "15px" }} title="Edit">✏</button>
                      <button onClick={() => handleDelete(user.acc_uname)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>Showing {filtered?.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered?.length)} of {filtered?.length} users</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="light-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={page === i + 1 ? "dark-btn" : "light-btn"} onClick={() => setPage(i + 1)} style={{ padding: "6px 10px", minWidth: "32px" }}>{i + 1}</button>
              ))}
              <button className="light-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Users;