import React from 'react'
import '../styles/Setting.css'
import ProfileTab from './tabcomponents/ProfileTab'
import SecurityTab from './tabcomponents/SecurityTab'
import NotificationTab from './tabcomponents/NotificationTab'
import ApprovalFlow from './tabcomponents/ApprovalFlow'
import MasterTab from './tabcomponents/MasterTab'
import axiosInstance from '../../config/axiosInstance'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/auth'
import { useNavigate } from 'react-router-dom'
import { masterListTabs } from './tabcomponents/masterListTabs'


const Setting = React.memo(function Setting() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = React.useState("Profile");
  const [showMasters, setShowMasters] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [plants, setPlants] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false)

  const storedUser = useSelector(state => state.auth.user) || {};
  const nameParts = React.useMemo(() => storedUser.acc_fname ? storedUser.acc_fname.split(" ") : ["", ""], [storedUser]);
  const [profile, setProfile] = React.useState({
    acc_fname: storedUser.acc_fname || "",
    acc_eml: storedUser.acc_eml || "",
    acc_phn: storedUser.acc_phn || "",
    acc_comp: storedUser.acc_comp || "",
    acc_plnt: storedUser.acc_plnt?._id || null,
    acc_dept: storedUser.acc_dept?._id || null,
  });
  const initials = React.useMemo(() => `${nameParts.join(" ")?.[0] || "U"}`.toUpperCase(), [nameParts]);

  const handleTabChange = React.useCallback((tab) => {
    setActiveTab(tab);
    setShowMasters(false);
    setSidebarOpen(false);
  }, [setActiveTab, setShowMasters, setSidebarOpen]);

  const handleLogout = React.useCallback(async () => {
    try {
      const response = await axiosInstance.post("/api/auth/logout");
      if (response.status === 200) {
        localStorage.removeItem("user");
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) { console.error(error); }
  }, [logout]);

  return (
    <>
      <div className="settings-header">
        <div className="settings-header-left">
          <h2>Settings</h2>
          <p>Manage your account and system preferences</p>
        </div>
        <button className="settings-mobile-toggle" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle settings menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div className="settings-container">
        <div className={`settings-sidebar ${sidebarOpen ? "settings-sidebar--open" : ""}`}>
          {["Profile", "Security", "Notifications", "Approval"].map((item) => (
            <div
              key={item}
              className={`settings-item ${activeTab === item ? "active" : ""}`}
              onClick={() => handleTabChange(item)}
            >
              {item}
            </div>
          ))}

          <div
            className={`settings-item ${activeTab === "Masters" ? "active" : ""}`}
            onClick={() => { setActiveTab("Masters"); setShowMasters(v => !v); setSidebarOpen(false); }}
          >
            Masters {showMasters ? "▴" : "▾"}
          </div>

          {showMasters && (
            <div className="master-submenu">
              {masterListTabs.map((item) => (
                <div key={item.key} className="settings-subitem" onClick={() => navigate(`/masters/${item.key}`)}>
                  {item.tabName}
                </div>
              ))}
            </div>
          )}

          <div className="settings-item Logout">
            <div className="logout-btn" onClick={handleLogout}>Logout</div>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === "Profile" && <ProfileTab />}
          {activeTab === "Security" && <SecurityTab />}
          {activeTab === "Notifications" && <NotificationTab />}
          {activeTab === "Approval" && <ApprovalFlow />}
          {activeTab === "Masters" && <MasterTab />}
        </div>
      </div>
    </>
  )
})

export default Setting