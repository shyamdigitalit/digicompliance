import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/auth";
import axiosInstance from "../../config/axiosInstance";
import { generateAbbreviation } from "../../utilities/genAbbreviation";
import { DndContext, KeyboardSensor, PointerSensor, useDroppable, pointerWithin } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const masterList = [
  "Account Type", "plant", "department", "company", "designation", "compliancetype",
  "compliancecategory", "compliancefrequency", "criticality", "penaltytype"
];

// const DEPTS = ["Operations", "HR", "Quality", "Finance", "IT", "Environment", "Safety"];
// const PLANTS = ["Mumbai Plant A", "Delhi Plant B", "Bangalore Plant C"];
const TIMEZONES = ["GMT +5:30 (India)", "GMT +0:00 (UTC)", "GMT -5:00 (EST)", "GMT +8:00 (CST)"];
const TAG_LABELS = ["Minimum 1 approver", "Quorum required", "Executive signature", "All must approve"];




// ── Approval Flow Sub-component ──────────────────────────────────────────────
let DEFAULT_STEPS = [];

// Draggable contents ------------------------------------------------------------
const SortableStep = ({ step, si, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id }) // NOT step-${si}

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{ cursor: "grab" }}>
        {/* Drag handle */}
        ⠿
      </div>
      {children}
    </div>
  );
};

const DroppableStep = ({ step, children }) => {
  const { setNodeRef } = useDroppable({
    id: step.id, // container id
  });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
};

const SortableApprover = ({ approver, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: approver.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* 🔹 ONLY THIS is draggable */}
      <div {...listeners} style={{ cursor: "grab" }}>
        ⠿
      </div>

      {children}
    </div>
  );
};

const ApprovalFlow = React.memo(() => {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activePlntTab, setActivePlntTab] = useState(0);
  const [activeDeptTab, setActiveDeptTab] = useState(0);
  const [steps, setSteps] = useState([...DEFAULT_STEPS]);
  const [modal, setModal] = useState(null); // null | stepIndex
  const [allAccs, setAllAccs] = useState([]);
  const [modalName, setModalName] = useState({});
  const [modalRole, setModalRole] = useState("");
  const [saved, setSaved] = useState(false);

  const fetchMasters = React.useCallback(async () => {
    try {
      const [plantsRes, deptsRes] = await Promise.all([
        axiosInstance.get("/api/plnt/fetch"),
        axiosInstance.get("/api/dept/fetch")
      ]);

      setPlants(plantsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);
  React.useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  const fetchApprovalFlow = React.useCallback(async () => {
    try {
      const cbase = plants[activePlntTab]?._id;
      const fnid = departments[activeDeptTab]?._id;

      if (!cbase || !fnid) return;

      setSteps([]);

      const res = await axiosInstance.get("/api/dynapprvl/fetch", {
        params: { cbase, fnid }
      });

      const record = res.data.data?.[0];

      if (record?.approvalDetails) {
        setSteps(
          record.approvalDetails.map(ad => ({
            id: ad._id || `step-${crypto.randomUUID()}`,
            title: ad.approvalTitle || `Step ${ad.approvalLevel}`,
            tag:
              ad.approvalTag ||
              TAG_LABELS[(ad.approvalLevel - 1) % TAG_LABELS.length],

            // ✅ FIXED mapping
            approvers: (ad.approvers || []).map(ap => {
              const acc = ap.approverAccount;

              return {
                id: acc?._id || crypto.randomUUID(),
                initials: acc?.acc_fname
                  ?.split(" ")
                  .map(w => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase(),
                name: acc?.acc_fname || "Unknown",
                role: ap.approverRole || "Team Member"
              };
            })
          }))
        );
      } else {
        setSteps([]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [plants, departments, activePlntTab, activeDeptTab]);
  React.useEffect(() => {
    if (plants.length && departments.length) {
      fetchApprovalFlow();
    }
  }, [fetchApprovalFlow, plants, departments]);

  const fetchAllAccounts = React.useCallback(async () => {
    try {
      const cbase = plants[activePlntTab]?._id;
      const fnid = departments[activeDeptTab]?._id;
      const response = await axiosInstance.get("/api/dynapprvl/acc/filter", {
        params: { cbase, fnid }
      });
      // console.log(response.data.data.Acc);
      if (response.status === 200) {
        const accounts = response.data.data || [];
        // console.log(accounts);
        setAllAccs(accounts);
      }
      else {
        setAllAccs([]);
      }
    } catch (error) {
      console.error(error)
    }
  }, [plants, departments, activePlntTab, activeDeptTab]);
  React.useEffect(() => {
    fetchAllAccounts();
  }, [fetchAllAccounts]);

  const getUsedAccountIds = (stepsData) => {
    return stepsData.flatMap(s => s.approvers.map(a => a.id));
  };

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

    const usedIds = getUsedAccountIds(steps);

    // ❌ Prevent duplicate assignment
    if (usedIds.includes(modalName)) {
      alert("This account is already assigned in this flow.");
      return;
    }

    const accDetails = allAccs.find(a => a._id === modalName);
    const initials = accDetails?.acc_fname
      .trim()
      .split(" ")
      .map(w => w[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setSteps(prev =>
      prev.map((s, i) =>
        i === modal
          ? {
              ...s,
              approvers: [
                ...s.approvers,
                {
                  initials,
                  id: accDetails?._id,
                  name: accDetails?.acc_fname.trim(),
                  role: modalRole.trim() || "Team Member"
                }
              ]
            }
          : s
      )
    );

    setModal(null);
  };

  const addStep = () => {
    const n = steps.length + 1;
    setSteps(prev => [...prev, { id: `step-${crypto.randomUUID()}`, title: `Step ${n}`, tag: TAG_LABELS[n % TAG_LABELS.length], approvers: [] }]);
  };

  const discard = () => setSteps([...DEFAULT_STEPS]);

  const updateStepTitle = (si, title) => {
    setSteps(prev =>
      prev.map((s, i) =>
        i === si ? { ...s, title } : s
      )
    );
  }

  const handleSave = async () => {
    let dynapprvlPayld = {}
    Object.assign(dynapprvlPayld, {
      approvalCode: `PLNT${plants[activePlntTab]?.code}DEPT${departments[activeDeptTab]?.code}`,
      approvalCreatorBase: plants[activePlntTab],
      approvalFunction: departments[activeDeptTab],
      approvalDetails: steps.map((s, i) => ({
        approvalLevel: i + 1,
        approvalTitle: s.title,
        approvalTag: s.tag,
        approvers: s.approvers.map(a => {
          const acc = allAccs.find(acc => acc.acc_fname.trim() === a.name);

          return {
            approverAbbreviation: generateAbbreviation(acc?.acc_fname), // ✅ FIX (IMPORTANT)

            approverAccount: acc?._id, // ✅ FIX (IMPORTANT)
            approverRole: a.role
          };
        })
      }))
    });

    console.log(dynapprvlPayld);

    try {
      const response = await axiosInstance.post(`/api/dynapprvl/create`, dynapprvlPayld);
      if (response.status === 201) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      console.error(error)
    }
  };


  // All Draggable logics
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;
    
    // 🔵 STEP DRAG (robust detection)
    const isStepDrag =
      steps.some(s => s.id === activeId) &&
      steps.some(s => s.id === overId);

    if (isStepDrag) {
      const oldIndex = steps.findIndex(s => s.id === activeId);
      const newIndex = steps.findIndex(s => s.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      setSteps(prev => {
        const updated = [...prev];
        const [moved] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, moved);
        return updated;
      });

      return;
    }

    // 🔵 APPROVER DRAG (same + interstep)
    setSteps(prev => {
      const updated = prev.map(step => ({
        ...step,
        approvers: [...step.approvers]
      }));

      const sourceIndex = updated.findIndex(s => s.id === activeContainer);
      const targetIndex = updated.findIndex(s => s.id === overContainer);

      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const sourceStep = updated[sourceIndex];
      const targetStep = updated[targetIndex];

      const movingIndex = sourceStep.approvers.findIndex(a => a.id === activeId);
      if (movingIndex === -1) return prev;

      const movingItem = sourceStep.approvers[movingIndex];

      // remove
      sourceStep.approvers = sourceStep.approvers.filter((_, i) => i !== movingIndex);

      // insert
      let newIndex = targetStep.approvers.findIndex(a => a.id === overId);

      if (newIndex === -1) {
        targetStep.approvers = [...targetStep.approvers, movingItem];
      } else {
        targetStep.approvers = [
          ...targetStep.approvers.slice(0, newIndex),
          movingItem,
          ...targetStep.approvers.slice(newIndex)
        ];
      }

      return updated;
    });
  };

  const findContainer = (id) => {
    if (steps.find(s => s.id === id)) return id;

    // inside step
    for (const step of steps) {
      if (step.approvers.some(a => a.id === id)) {
        return step.id;
      }
    }

    return null;
  };

  return (
    <div className="profile-card approval-card">
      <h3>Dynamic Approval Flow</h3>

      {/* Process tabs */}
      <div className="approval-tabs plnt-tabs">
        {plants.map((t, i) => (
          <button
            key={t?._id}
            className={`approval-tab ${activePlntTab === i ? "active" : ""}`}
            onClick={() => {
              setActivePlntTab(i);
              setSteps([]); // reset immediately
            }}
          >
            {t?.name}
          </button>
        ))}
      </div>
      <div className="approval-tabs dept-tabs">
        {departments.map((t, i) => (
          <button
            key={t?._id}
            className={`approval-tab ${activeDeptTab === i ? "active" : ""}`}
            onClick={() => {
              setActiveDeptTab(i);
              setSteps([]); // reset immediately
            }}
          >
            {t?.name}
          </button>
        ))}
      </div>

      {/* Steps */}
      <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
        <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="approval-steps">
            {steps.map((step, si) => (
              <DroppableStep key={step.id} step={step}>
                <SortableStep key={step.id || si} step={step} si={si}>
                  <div className="approval-step-card" key={si}>
                    <div className="level-badge">L{si + 1}</div>
                    <div className="step-body">
                      <div className="step-header">
                        <input type="text" className="step-title" name="step-title" id="" value={step.title} onChange={(e) => updateStepTitle(si, e.target.value)} />
                        <select className="step-tag" name="step-tag" id="" value={step.tag} onChange={(e) => {
                          const newTag = e.target.value;
                          setSteps(prev => prev.map((s, i) => i === si ? { ...s, tag: newTag } : s));
                        }}>
                          {TAG_LABELS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
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

                        <SortableContext items={step.approvers.map(a => a.id)} strategy={verticalListSortingStrategy}>
                          {step.approvers.map((a, ai) => (
                            <SortableApprover key={a.id} approver={a}>
                              <div className="approver-chip" key={ai}>
                                <div className={`approver-avatar avatar-${ai % 3}`}>{a.initials}</div>
                                <div className="chip-info">
                                  <div className="chip-name">{a.name}</div>
                                  <div className="chip-role">{a.role}</div>
                                </div>
                                <button className="del-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();        // ✅ stops drag system
                                    e.preventDefault();         // ✅ prevents unintended drag
                                    removeApprover(si, ai);
                                  }}
                                  title="Remove"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M10 8v4M6 8v4M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"
                                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                  </svg>
                                </button>
                              </div>
                            </SortableApprover>
                          ))}
                        </SortableContext>
                        
                        <button className="add-approver-btn" onClick={() => openModal(si)}>
                          <svg width="14" height="14" viewBox="0 0 16 16">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          Add Approver
                        </button>
                      </div>
                    </div>
                  </div>
                </SortableStep>
              </DroppableStep>
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
            <select name="" id="" onChange={e => {
              console.log(e.target.value);
              setModalName(e.target.value)
            }} value={modalName}>
              <option value="">Select an account</option>
              {allAccs
                ?.filter(a => !getUsedAccountIds(steps).includes(a._id))
                .map(a => (
                  <option key={a._id} value={a._id}>
                    {a.acc_fname}
                  </option>
              ))}
            </select>
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
});




// ── Main Settings Component ───────────────────────────────────────────────────
const Settings = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [showMasters, setShowMasters] = useState(false);
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const storedUser = useSelector(state => state.auth.user) || {};
  // console.log(storedUser);
  const nameParts = storedUser.acc_fname ? storedUser.acc_fname.split(" ") : ["", ""];
  const [profile, setProfile] = useState({
    fullName: storedUser.acc_fname || "",
    email: storedUser.acc_eml || "",
    phone: storedUser.acc_phn || "",
    company: storedUser.acc_comp || "",
    defaultPlant: storedUser.acc_plnt?.name || "",
    department: storedUser.acc_dept?.name || "",
  });

  const initials = `${nameParts.join(" ")?.[0] || "U"}`.toUpperCase();

  const fetchMasters = React.useCallback(async () => {
    try {
      const [plantsRes, deptsRes] = await Promise.all([
        axiosInstance.get("/api/plnt/fetch"),
        axiosInstance.get("/api/dept/fetch")
      ]);

      setPlants(plantsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);
  React.useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // const updated = { ...storedUser, ...profile, name: `${profile.fullName} ${profile.lastName}` };
    // localStorage.setItem("user", JSON.stringify(updated));
    // setSaved(true);
    // setTimeout(() => setSaved(false), 2500);
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
                  <div style={{ fontWeight: 600 }}>{profile.fullName}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{profile.email}</div>
                </div>
              </div>
              <hr />
              <div className="form-grid">
                <div><label>Full Name</label><input name="fullName" value={profile.fullName} onChange={handleProfileChange} /></div>
                {/* <div><label>Last Name</label><input name="lastName" value={profile.lastName} onChange={handleProfileChange} /></div> */}
                <div><label>Email Address</label><input name="email" value={profile.email} onChange={handleProfileChange} /></div>
                <div><label>Phone Number</label><input name="phone" value={profile.phone} onChange={handleProfileChange} /></div>
                <div><label>Company Name</label><input name="company" value={profile.company} onChange={handleProfileChange} /></div>
                <div>
                  <label>Default Plant</label>
                  <select name="defaultPlant" value={profile.defaultPlant} onChange={handleProfileChange}>
                    <option value="">Choose</option>
                    {plants.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Department</label>
                  <select name="department" value={profile.department} onChange={handleProfileChange}>
                    <option value="">Choose</option>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
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