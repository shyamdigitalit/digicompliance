import React, { Suspense } from 'react'
import '../styles/Setting.css'
import ProfileTab from './tabcomponents/ProfileTab'
import SecurityTab from './tabcomponents/SecurityTab'
import NotificationTab from './tabcomponents/NotificationTab'
// import ApprovalFlow from './tabcomponents/ApprovalFlow'
const ApprovalFlow = React.lazy(() => import('./tabcomponents/ApprovalFlow'))
const Privileges = React.lazy(() => import('./tabcomponents/Privileges'))
import MasterTab from './tabcomponents/MasterTab'
import axiosInstance from '../../config/axiosInstance'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/auth'
import { useNavigate } from 'react-router-dom'
import { masterListTabs } from './tabcomponents/masterListTabs'
import Loader from '../../components/loader'


const Setting = React.memo(function Setting() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = React.useState("Profile");
  const [showMasters, setShowMasters] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // const [plants, setPlants] = React.useState([]);
  // const [departments, setDepartments] = React.useState([]);
  // const [saved, setSaved] = React.useState(false);
  const navigate = useNavigate();
  // const [loading, setLoading] = React.useState(false)
  const [_, startTransition] = React.useTransition()

  // const storedUser = useSelector(state => state.auth.user) || {};
  // const nameParts = React.useMemo(() => storedUser.acc_fname ? storedUser.acc_fname.split(" ") : ["", ""], []);
  // const [profile, setProfile] = React.useState({
  //   acc_fname: storedUser.acc_fname || "",
  //   acc_eml: storedUser.acc_eml || "",
  //   acc_phn: storedUser.acc_phn || "",
  //   acc_comp: storedUser.acc_comp || "",
  //   acc_plnt: storedUser.acc_plnt?._id || null,
  //   acc_dept: storedUser.acc_dept?._id || null,
  // });
  // const initials = React.useMemo(() => `${nameParts.join(" ")?.[0] || "U"}`.toUpperCase(), [nameParts]);

  const handleSidebar = React.useCallback(() => setSidebarOpen(v => !v), [])

  const handleTabChange = React.useCallback((tab) => {
    startTransition(() => { setActiveTab(tab)})
    setShowMasters(false);
    setSidebarOpen(false);
  }, []);

  const handleExpand = React.useCallback(() => {
    startTransition(() => { setActiveTab("Masters")})
    setShowMasters(v => !v);
    setSidebarOpen(false);
  }, [])

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/auth/logout");
      if (response.status === 200) {
        localStorage.removeItem("user");
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) { console.error(error); }
  };

  return (
    <>
      <div className="settings-header">
        <div className="settings-header-left">
          <h2>Settings</h2>
          <p>Manage your account and system preferences</p>
        </div>
        <button className="settings-mobile-toggle" onClick={handleSidebar} aria-label="Toggle settings menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div className="settings-container">
        <div className={`settings-sidebar ${sidebarOpen ? "settings-sidebar--open" : ""}`}>
          {["Profile", "Security", "Notifications", "Approval", "Privilege"].map((item) => (
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
            onClick={handleExpand}
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
          <Suspense fallback={<Loader />}>{activeTab === "Approval" && <ApprovalFlow />}</Suspense>
          <Suspense fallback={<Loader />}>{activeTab === "Privilege" && <Privileges />}</Suspense>
          {activeTab === "Masters" && <MasterTab />}
        </div>
      </div>
    </>
  )
})

export default Setting