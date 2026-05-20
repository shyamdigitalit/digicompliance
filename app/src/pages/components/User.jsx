import React from "react";
import "../styles/User.css";
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import AddUser from "./AddUser";
import axiosInstance from "../../config/axiosInstance";
import Loader from "../../components/loader";

const USER_KEY = "user_data";

const PAGE_SIZE = 10;

const Users = () => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterPlant, setFilterPlant] = React.useState("");
  const [filterDepartment, setFilterDepartment] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [saved, setSaved] = React.useState(false);

  const getAllUserData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/acc/fetchuppr");
      if (response?.status === 200) {
        setData(response.data?.data?.Acc);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getAllUserData();
  }, [getAllUserData]);

  React.useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }, [data]);

  const roles = React.useMemo(() => [...new Set(data?.map(d => d.acc_typ?.typname || ""))].filter(Boolean), [data]);
  const plants = React.useMemo(() => [...new Set(data?.map(d => d.acc_plnt?.name || ""))].filter(Boolean), [data]);
  const departments = React.useMemo(() => [...new Set(data?.map(d => d.acc_dept?.name || ""))].filter(Boolean), [data]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return data?.filter(u => {
      const matchSearch = !q || u.acc_fname.toLowerCase().includes(q) || u.acc_uname.toLowerCase().includes(q) || u.acc_eml.toLowerCase().includes(q);
      const matchRole = !filterRole || u.acc_typ === filterRole;
      const matchPlant = !filterPlant || u.acc_plnt === filterPlant;
      const matchDepartment = !filterDepartment || u.acc_dept === filterDepartment;
      return matchSearch && matchRole && matchPlant && matchDepartment;
    });
  }, [data, search, filterRole, filterPlant, filterDepartment]);

  const totalPages = React.useMemo(() => Math.ceil(filtered?.length / PAGE_SIZE), [filtered]);
  const paged = React.useMemo(() => filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const getRoleClass = React.useCallback((role) => {
    if (role?.includes("Developer")) return "tag red";
    if (role?.includes("Supervisor")) return "tag blue";
    if (role?.includes("Admin")) return "tag purple";
    if (role?.includes("General")) return "tag green";
    return "tag orange";
  }, []);

  const handleAddSubmit = React.useCallback(async (formData) => {
    try {
      if (editingUser) {
        setData(prev => prev.map(u => u.acc_uname === editingUser.acc_uname ? { ...u, ...formData } : u));
        const response = await axiosInstance.patch(`/api/acc/update?id=${editingUser._id}`, formData);
        if (response?.status === 201) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setEditingUser(null);
            setShowAddForm(false);
            getAllUserData();
          }, 1000);
        }
      } else {
        setData(prev => [...prev, {
          acc_uname: formData.acc_uname,
          acc_fname: formData.acc_fname,
          acc_eml: formData.acc_eml,
          acc_typ: formData.acc_typ,
          acc_plnt: formData.acc_plnt,
          acc_dept: formData.acc_dept
        }]);
        const response = await axiosInstance.post("/api/acc/create", formData);
        if (response?.status === 201) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setShowAddForm(false);
            getAllUserData();
          }, 1000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [editingUser, getAllUserData]);

  const handleEdit = React.useCallback((user) => {
    setEditingUser(user);
    setShowAddForm(true);
  }, []);

  const handleDelete = React.useCallback(async (id) => {
    try {
      if (window.confirm("Delete this user?")) {
        const response = await axiosInstance.delete(`/api/acc/delete?id=${id}`);
        if (response.status === 200) {
          setData(prev => prev.filter(u => u._id !== id));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const resetFilters = () => {
    setSearch(""); setFilterRole(""); setFilterPlant(""); setFilterDepartment(""); setPage(1);
  };

  return (
    <>
      {showAddForm ? (
        <AddUser
          onCancel={() => { setShowAddForm(false); setEditingUser(null); }}
          onSubmit={handleAddSubmit}
          initialData={editingUser}
          mode={editingUser ? "edit" : "add"}
          saved={saved}
        />
      ) : (
        <>
          <div className="user-header">
            <h2>User Management</h2>
            <p>Manage users and their access to the compliance system</p>
          </div>

          {loading ? <Loader /> : (
            <>
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
                <select value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); setPage(1); }}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
                {(search || filterRole || filterPlant || filterDepartment) && (
                  <button className="light-btn" onClick={resetFilters}>✕ Clear</button>
                )}
                <button className="add-btn" onClick={() => { setEditingUser(null); setShowAddForm(true); }}>+ Add User</button>
              </div>

              <div className="user-table">
                <div className="user-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Plant</th>
                        <th>Department</th>
                        <th>Heirarchy</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged?.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>
                            No users found
                          </td>
                        </tr>
                      ) : paged?.map((user, i) => (
                        <tr key={i}>
                          <td className="link">{user.acc_uname}</td>
                          <td>{user.acc_fname}</td>
                          <td>{user.acc_eml}</td>
                          <td><span className={getRoleClass(user.acc_typ?.typname)}>{user.acc_typ?.typname}</span></td>
                          <td>{user.acc_plnt?.name}</td>
                          <td>{user.acc_dept?.name}</td>
                          <td>{user.acc_typ?.heirarchy}</td>
                          <td style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleEdit(user)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "15px" }} title="Edit"><EditNoteOutlinedIcon /></button>
                            <button onClick={() => handleDelete(user._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete"><DeleteSweepOutlinedIcon /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-footer">
                <span>
                  Showing {filtered?.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered?.length)} of {filtered?.length} users
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
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
            </>
          )}
        </>
      )}
    </>
  );
};

export default Users;