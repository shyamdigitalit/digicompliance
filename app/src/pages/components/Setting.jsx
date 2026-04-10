import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/auth";
import axiosInstance from "../../config/axiosInstance";

const masterList = [
  "Account Type", "plant", "department", "company", "designation", "compliancetype",
  "compliancecategory", "compliancefrequency", "criticality", "penaltytype"
];

const DEPTS = ["Operations", "HR", "Quality", "Finance", "IT", "Environment", "Safety"];
const PLANTS = ["Mumbai Plant A", "Delhi Plant B", "Bangalore Plant C"];
const TIMEZONES = ["GMT +5:30 (India)", "GMT +0:00 (UTC)", "GMT -5:00 (EST)", "GMT +8:00 (CST)"];

const Settings = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [showMasters, setShowMasters] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const [profile, setProfile] = useState({
    firstName: storedUser.firstName || storedUser.name?.split(" ")[0] || "John",
    lastName: storedUser.lastName || storedUser.name?.split(" ")[1] || "Doe",
    email: storedUser.email || "john.doe@company.com",
    phone: storedUser.phone || "+91 99999 00000",
    company: storedUser.company || "Industrial Solutions Inc.",
    department: storedUser.department || "Operations",
    defaultPlant: storedUser.defaultPlant || "Mumbai Plant A",
    timezone: storedUser.timezone || "GMT +5:30 (India)",
  });

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    const updated = {
      ...storedUser,
      ...profile,
      name: `${profile.firstName} ${profile.lastName}`,
    };
    localStorage.setItem("user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/auth/logout");
      if (response.status === 200) {
        console.log("Logged out successfully");
        localStorage.removeItem("user");
        dispatch(logout())
        navigate("/login");
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account and system preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {["Profile", "Security", "Notifications"].map((item) => (
            <div
              key={item}
              className={`settings-item ${activeTab === item ? "active" : ""}`}
              onClick={() => { setActiveTab(item); setShowMasters(false); }}
            >
              {item}
            </div>
          ))}

          <div
            className={`settings-item ${activeTab === "Masters" ? "active" : ""}`}
            onClick={() => { setActiveTab("Masters"); setShowMasters(v => !v); }}
          >
            Masters {showMasters ? "▴" : "▾"}
          </div>

          {showMasters && (
            <div className="master-submenu">
              {masterList.map((item) => (
                <div
                  key={item}
                  className="settings-subitem"
                  onClick={() => navigate(`/masters/${item}`)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </div>
              ))}
            </div>
          )}

          <div className={`settings-item Logout`}>
            <div className="logout-btn" onClick={handleLogout}>
              Logout
            </div>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === "Profile" && (
            <div className="profile-card">
              <h3>Profile Information</h3>
              <p>Update your personal information and profile details</p>

              <div className="profile-top">
                <div className="avatar" style={{ fontSize: initials.length > 2 ? "14px" : undefined }}>{initials || "JD"}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{profile.firstName} {profile.lastName}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{profile.email}</div>
                </div>
              </div>

              <hr />

              <div className="form-grid">
                <div>
                  <label>First Name</label>
                  <input name="firstName" value={profile.firstName} onChange={handleProfileChange} />
                </div>
                <div>
                  <label>Last Name</label>
                  <input name="lastName" value={profile.lastName} onChange={handleProfileChange} />
                </div>
                <div>
                  <label>Email Address</label>
                  <input name="email" value={profile.email} onChange={handleProfileChange} />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input name="phone" value={profile.phone} onChange={handleProfileChange} />
                </div>
                <div>
                  <label>Company Name</label>
                  <input name="company" value={profile.company} onChange={handleProfileChange} />
                </div>
                <div>
                  <label>Department</label>
                  <select name="department" value={profile.department} onChange={handleProfileChange}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label>Default Plant</label>
                  <select name="defaultPlant" value={profile.defaultPlant} onChange={handleProfileChange}>
                    {PLANTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label>Time Zone</label>
                  <select name="timezone" value={profile.timezone} onChange={handleProfileChange}>
                    {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <button className="dark-btn" onClick={handleSaveProfile}>Save Changes</button>
                {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Saved successfully</span>}
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="profile-card">
              <h3>Notification Preferences</h3>
              <p>Control how and when you receive notifications</p>
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {["Email alerts for overdue compliance", "SMS reminders for upcoming deadlines", "In-app notifications for new documents", "Weekly compliance summary report"].map(item => (
                  <label key={item} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ width: "16px", height: "16px" }} />
                    {item}
                  </label>
                ))}
              </div>
              <div className="timer"></div>
              <button className="dark-btn" style={{ marginTop: "20px" }}>Save Preferences</button>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="profile-card">
              <h3>Security Settings</h3>
              <p>Manage your password and account security</p>
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div><label>Current Password</label><input type="password" placeholder="••••••••" /></div>
                <div><label>New Password</label><input type="password" placeholder="••••••••" /></div>
                <div><label>Confirm New Password</label><input type="password" placeholder="••••••••" /></div>
              </div>
              <button className="dark-btn" style={{ marginTop: "20px" }}>Update Password</button>
            </div>
          )}

          {(activeTab === "Organization" || activeTab === "System") && (
            <div className="profile-card">
              <h3>{activeTab} Settings</h3>
              <p>Configure {activeTab.toLowerCase()} settings for your compliance system</p>
              <div style={{ marginTop: "30px", color: "#9ca3af", fontSize: "14px" }}>
                This section is under development.
              </div>
            </div>
          )}

          {activeTab === "Masters" && !showMasters && (
            <div className="profile-card">
              <h3>Master Data Management</h3>
              <p>Manage lookup data used across the compliance system</p>
              <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {masterList.map(item => (
                  <button key={item} className="light-btn" style={{ textAlign: "left", padding: "12px 14px" }} onClick={() => navigate(`/masters/${item}`)}>
                    {item.charAt(0).toUpperCase() + item.slice(1)} →
                  </button>
                ))}
              </div>
            </div>
          )}

          
        </div>
      </div>
    </>
  );
};

export default Settings;
