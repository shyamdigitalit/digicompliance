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
const PROCESS_TABS = ["ADMIN", "CPP", "ELECTRICAL", "HR", "SAFETY", "ENVIRONMENT"];
const TAG_LABELS = ["Minimum 1 approver", "Quorum required", "Executive signature", "All must approve"];

const DEFAULT_STEPS = [
  {
    title: "Initial Verification",
    tag: "Minimum 1 approver",
    approvers: [
      { initials: "SG", name: "Siddhartha Ghosh", role: "Claims Officer" },
      { initials: "AK", name: "Ananya Kapoor", role: "Audit Associate" },
    ],
  },
  {
    // title: "Risk Assessment",
    tag: "Quorum required",
    approvers: [
      { initials: "RM", name: "Rahul Mehta", role: "Senior Underwriter" },
    ],
  },
  {
    // title: "Final Disbursement",
    tag: "Executive signature",
    approvers: [],
  },
];

// ── Approval Flow Sub-component ──────────────────────────────────────────────
const ApprovalFlow = () => {
  const [activeProcessTab, setActiveProcessTab] = useState(1);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [modal, setModal] = useState(null); // null | stepIndex
  const [modalName, setModalName] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [saved, setSaved] = useState(false);

  const removeApprover = (si, ai) => {
    setSteps(prev =>
      prev.map((s, i) =>
        i === si ? { ...s, approvers: s.approvers.filter((_, j) => j !== ai) } : s
      )
    );
  };

  const openModal = (si) => {
    setModalName("");
    setModalRole("");
    setModal(si);
  };

  const confirmAdd = () => {
    if (!modalName.trim()) return;
    const initials = modalName.trim().split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase();
    setSteps(prev =>
      prev.map((s, i) =>
        i === modal
          ? { ...s, approvers: [...s.approvers, { initials, name: modalName.trim(), role: modalRole.trim() || "Team Member" }] }
          : s
      )
    );
    setModal(null);
  };

  const addStep = () => {
    const n = steps.length + 1;
    setSteps(prev => [...prev, { title: `Step ${n}`, tag: TAG_LABELS[n % TAG_LABELS.length], approvers: [] }]);
  };

  const discard = () => setSteps(DEFAULT_STEPS);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="profile-card approval-card">
      <h3>Dynamic Approval Flow</h3>

      {/* Process tabs */}
      <div className="approval-tabs">
        {PROCESS_TABS.map((t, i) => (
          <button
            key={t}
            className={`approval-tab ${activeProcessTab === i ? "active" : ""}`}
            onClick={() => setActiveProcessTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="approval-steps">
        {steps.map((step, si) => (
          <div className="approval-step-card" key={si}>
            <div className="level-badge">L{si + 1}</div>
            <div className="step-body">
              <div className="step-header">
                <span className="step-title">{step.title}</span>
                <span className="step-tag">{step.tag.toUpperCase()}</span>
              </div>
              <div className="approvers-row">
                {step.approvers.length === 0 && (
                  <div className="empty-slot">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    No approvers assigned...
                  </div>
                )}
                {step.approvers.map((a, ai) => (
                  <div className="approver-chip" key={ai}>
                    <div className={`approver-avatar avatar-${ai % 3}`}>{a.initials}</div>
                    <div className="chip-info">
                      <div className="chip-name">{a.name}</div>
                      <div className="chip-role">{a.role}</div>
                    </div>
                    <button className="del-btn" onClick={() => removeApprover(si, ai)} title="Remove">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M10 8v4M6 8v4M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"
                          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button className="add-approver-btn" onClick={() => openModal(si)}>
                  <svg width="14" height="14" viewBox="0 0 16 16">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add Approver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Step */}
      <div className="add-step-wrap">
        <button className="add-step-btn" onClick={addStep}>
          <svg width="14" height="14" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Step
        </button>
      </div>

      {/* Footer */}
      <div className="approval-footer">
        <button className="discard-btn" onClick={discard}>Discard Changes</button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Saved successfully</span>}
          <button className="save-flow-btn" onClick={handleSave}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 2h9l3 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 2v4h6V2M5 9h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Save Flow Configuration
          </button>
        </div>
      </div>

      {/* Add Approver Modal */}
      {modal !== null && (
        <div className="approval-modal-overlay" onClick={() => setModal(null)}>
          <div className="approval-modal" onClick={e => e.stopPropagation()}>
            <h4>Add approver to step {modal + 1}</h4>
            <input
              placeholder="Full name"
              value={modalName}
              onChange={e => setModalName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirmAdd()}
              autoFocus
            />
            <input
              placeholder="Role / title"
              value={modalRole}
              onChange={e => setModalRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirmAdd()}
            />
            <div className="modal-btns">
              <button className="light-btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="save-flow-btn" onClick={confirmAdd}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Settings Component ───────────────────────────────────────────────────
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
    const updated = { ...storedUser, ...profile, name: `${profile.firstName} ${profile.lastName}` };
    localStorage.setItem("user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/auth/logout");
      if (response.status === 200) {
        localStorage.removeItem("user");
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account and system preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {["Profile", "Security", "Notifications", "Approval"].map((item) => (
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
                <div key={item} className="settings-subitem" onClick={() => navigate(`/masters/${item}`)}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </div>
              ))}
            </div>
          )}

          <div className="settings-item Logout">
            <div className="logout-btn" onClick={handleLogout}>Logout</div>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === "Profile" && (
            <div className="profile-card">
              <h3>Profile Information</h3>
              <p>Update your personal information and profile details</p>
              <div className="profile-top">
                <div className="avatar">{initials || "JD"}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{profile.firstName} {profile.lastName}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{profile.email}</div>
                </div>
              </div>
              <hr />
              <div className="form-grid">
                <div><label>First Name</label><input name="firstName" value={profile.firstName} onChange={handleProfileChange} /></div>
                <div><label>Last Name</label><input name="lastName" value={profile.lastName} onChange={handleProfileChange} /></div>
                <div><label>Email Address</label><input name="email" value={profile.email} onChange={handleProfileChange} /></div>
                <div><label>Phone Number</label><input name="phone" value={profile.phone} onChange={handleProfileChange} /></div>
                <div><label>Company Name</label><input name="company" value={profile.company} onChange={handleProfileChange} /></div>
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

          {activeTab === "Approval" && <ApprovalFlow />}

          {activeTab === "Masters" && (
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