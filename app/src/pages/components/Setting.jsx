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
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/auth'
import { useNavigate } from 'react-router-dom'
import { masterListTabs } from './tabcomponents/masterListTabs'
import Loader from '../../components/loader'

const subMenu = [
  { key: "profile", tabName: "Profile", level: 0 },
  { key: "security", tabName: "Security", level: 0 },
  { key: "notifications", tabName: "Notifications", level: 2 },
  { key: "approval", tabName: "Approval", level: 2 },
  // { key: "privilege", tabName: "Privilege", level: 1 },
]


const Setting = React.memo(function Setting() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [showMasters, setShowMasters] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  // const [loading, setLoading] = React.useState(false)
  const [_, startTransition] = React.useTransition()
  const user = useSelector(state => state.auth.user)

  const filteredSubMenu = subMenu?.filter(m => {
    if (m.level===0) return m
    if (m.level!==0 && m.level>=user?.acc_typ?.heirarchy) return m
  })
  // console.log(filteredSubMenu);
  const filteredMasterListTabs = masterListTabs?.filter(m => {
    if (m.level===0) return m
    if (m.level!==0 && m.level>=user?.acc_typ?.heirarchy) return m
  })
  // console.log(filteredMasterListTabs);

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
          {filteredSubMenu.map((item) => (
            <div
              key={item.key}
              className={`settings-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => handleTabChange(item.key)}
            >
              {item.tabName}
            </div>
          ))}

          {user?.acc_typ?.heirarchy<3 && (
            <div
              className={`settings-item ${activeTab === "Masters" ? "active" : ""}`}
              onClick={handleExpand}
            >
              Masters {showMasters ? "▴" : "▾"}
            </div>
          )}
          {/* <div
              className={`settings-item ${activeTab === "Masters" ? "active" : ""}`}
              onClick={handleExpand}
            >
              Masters {showMasters ? "▴" : "▾"}
            </div> */}

          {showMasters && (
            <div className="master-submenu">
              {filteredMasterListTabs.map((item) => (
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
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && user?.acc_typ?.heirarchy<3 && <NotificationTab />}
          <Suspense fallback={<Loader />}>{activeTab === "approval" && <ApprovalFlow />}</Suspense>
          <Suspense fallback={<Loader />}>{activeTab === "privilege" && <Privileges />}</Suspense>
          {activeTab === "Masters" && <MasterTab />}
        </div>
      </div>
    </>
  )
})

export default Setting