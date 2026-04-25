import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useDispatch, useSelector } from "react-redux";
import { logout, updateProfile } from "../../redux/slices/auth";
import axiosInstance from "../../config/axiosInstance";
import { generateAbbreviation } from "../../utilities/genAbbreviation";
import { DndContext, KeyboardSensor, PointerSensor, useDroppable, pointerWithin } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const masterList = [
  "Account Type", "plant", "department", "company", "designation", "compliancetype",
  "compliancecategory", "compliancefrequency", "criticality", "penaltytype"
];

const TIMEZONES = ["GMT +5:30 (India)", "GMT +0:00 (UTC)", "GMT -5:00 (EST)", "GMT +8:00 (CST)"];
const TAG_LABELS = ["Minimum 1 approver", "Quorum required", "Executive signature", "All must approve"];

// ── Approval Flow Sub-component ──────────────────────────────────────────────
let DEFAULT_STEPS = [];

const SortableStep = ({ step, si, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{ cursor: "grab" }}>⠿</div>
      {children}
    </div>
  );
};

const DroppableStep = ({ step, children }) => {
  const { setNodeRef } = useDroppable({ id: step.id });
  return <div ref={setNodeRef}>{children}</div>;
};

const SortableApprover = ({ approver, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: approver.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{ cursor: "grab" }}>⠿</div>
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
  const [modal, setModal] = useState(null);
  const [allAccs, setAllAccs] = useState([]);
  const [modalName, setModalName] = useState({});
  const [modalRole, setModalRole] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMasters = React.useCallback(async () => {
    try {
      const [plantsRes, deptsRes] = await Promise.all([
        axiosInstance.get("/api/plnt/fetch"),
        axiosInstance.get("/api/dept/fetch")
      ]);
      setPlants(plantsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    } catch (error) { console.error(error); }
  }, []);
  React.useEffect(() => { fetchMasters(); }, [fetchMasters]);

  const fetchApprovalFlow = React.useCallback(async () => {
    try {
      const cbase = plants[activePlntTab]?._id;
      const fnid = departments[activeDeptTab]?._id;
      if (!cbase || !fnid) return;
      setLoading(true);
      setSteps([]);
      const res = await axiosInstance.get("/api/dynapprvl/fetch", { params: { cbase, fnid } });
      const record = res.data.data?.[0];
      if (record?.approvalDetails) {
        setSteps(record.approvalDetails.map(ad => ({
          id: ad._id || `step-${crypto.randomUUID()}`,
          title: ad.approvalTitle || `Step ${ad.approvalLevel}`,
          tag: ad.approvalTag || TAG_LABELS[(ad.approvalLevel - 1) % TAG_LABELS.length],
          approvers: (ad.approvers || []).map(ap => {
            const acc = ap.approverAccount;
            return {
              id: acc?._id || crypto.randomUUID(),
              initials: acc?.acc_fname?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
              name: acc?.acc_fname || "Unknown",
              role: ap.approverRole || "Team Member"
            };
          })
        })));
      } else { setSteps([]); }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [plants, departments, activePlntTab, activeDeptTab]);
  React.useEffect(() => {
    if (plants.length && departments.length) fetchApprovalFlow();
  }, [fetchApprovalFlow, plants, departments]);

  const fetchAllAccounts = React.useCallback(async () => {
    try {
      const cbase = plants[activePlntTab]?._id;
      const fnid = departments[activeDeptTab]?._id;
      const response = await axiosInstance.get("/api/dynapprvl/acc/filter", { params: { cbase, fnid } });
      if (response.status === 200) setAllAccs(response.data.data || []);
      else setAllAccs([]);
    } catch (error) { console.error(error); }
  }, [plants, departments, activePlntTab, activeDeptTab]);
  React.useEffect(() => { fetchAllAccounts(); }, [fetchAllAccounts]);

  const getUsedAccountIds = (stepsData) => stepsData.flatMap(s => s.approvers.map(a => a.id));

  const removeApprover = (si, ai) =>
    setSteps(prev => prev.map((s, i) => i === si ? { ...s, approvers: s.approvers.filter((_, j) => j !== ai) } : s));

  const openModal = (si) => { setModalName(""); setModalRole(""); setModal(si); };

  const confirmAdd = () => {
    if (!modalName.trim()) return;
    const usedIds = getUsedAccountIds(steps);
    if (usedIds.includes(modalName)) { alert("This account is already assigned in this flow."); return; }
    const accDetails = allAccs.find(a => a._id === modalName);
    const initials = accDetails?.acc_fname.trim().split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase();
    setSteps(prev => prev.map((s, i) => i === modal ? { ...s, approvers: [...s.approvers, { initials, id: accDetails?._id, name: accDetails?.acc_fname.trim(), role: modalRole.trim() || "Team Member" }] } : s));
    setModal(null);
  };

  const addStep = () => {
    const n = steps.length + 1;
    setSteps(prev => [...prev, { id: `step-${crypto.randomUUID()}`, title: `Step ${n}`, tag: TAG_LABELS[n % TAG_LABELS.length], approvers: [] }]);
  };

  const discard = () => setSteps([...DEFAULT_STEPS]);
  const updateStepTitle = (si, title) => setSteps(prev => prev.map((s, i) => i === si ? { ...s, title } : s));

  const handleSave = async () => {
    let dynapprvlPayld = {};
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
          return { approverAbbreviation: generateAbbreviation(acc?.acc_fname), approverAccount: acc?._id, approverRole: a.role };
        })
      }))
    });
    try {
      const response = await axiosInstance.post(`/api/dynapprvl/create`, dynapprvlPayld);
      if (response.status === 201) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } catch (error) { console.error(error); }
  };

  const findContainer = (id) => {
    if (steps.find(s => s.id === id)) return id;
    for (const step of steps) { if (step.approvers.some(a => a.id === id)) return step.id; }
    return null;
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id, overId = over.id;
    const activeContainer = findContainer(activeId), overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;
    const isStepDrag = steps.some(s => s.id === activeId) && steps.some(s => s.id === overId);
    if (isStepDrag) {
      const oldIndex = steps.findIndex(s => s.id === activeId);
      const newIndex = steps.findIndex(s => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      setSteps(prev => { const updated = [...prev]; const [moved] = updated.splice(oldIndex, 1); updated.splice(newIndex, 0, moved); return updated; });
      return;
    }
    setSteps(prev => {
      const updated = prev.map(step => ({ ...step, approvers: [...step.approvers] }));
      const sourceIndex = updated.findIndex(s => s.id === activeContainer);
      const targetIndex = updated.findIndex(s => s.id === overContainer);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const sourceStep = updated[sourceIndex], targetStep = updated[targetIndex];
      const movingIndex = sourceStep.approvers.findIndex(a => a.id === activeId);
      if (movingIndex === -1) return prev;
      const movingItem = sourceStep.approvers[movingIndex];
      sourceStep.approvers = sourceStep.approvers.filter((_, i) => i !== movingIndex);
      let newIndex = targetStep.approvers.findIndex(a => a.id === overId);
      if (newIndex === -1) targetStep.approvers = [...targetStep.approvers, movingItem];
      else targetStep.approvers = [...targetStep.approvers.slice(0, newIndex), movingItem, ...targetStep.approvers.slice(newIndex)];
      return updated;
    });
  };

  return (
    <div className="profile-card approval-card">
      <h3>Dynamic Approval Flow</h3>
      <div className="approval-tabs plnt-tabs">
        {plants.map((t, i) => (
          <button key={t?._id} className={`approval-tab ${activePlntTab === i ? "active" : ""}`} onClick={() => { setActivePlntTab(i); setSteps([]); }}>{t?.name}</button>
        ))}
      </div>
      <div className="approval-tabs dept-tabs">
        {departments.map((t, i) => (
          <button key={t?._id} className={`approval-tab ${activeDeptTab === i ? "active" : ""}`} onClick={() => { setActiveDeptTab(i); setSteps([]); }}>{t?.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="loader-overlay" role="status" aria-label="Loading approval flow">
          <div className="loader">
            <span className="loader__dot"></span>
            <span className="loader__dot"></span>
            <span className="loader__dot"></span>
          </div>
        </div>
      ) : (
        <>
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
                            <input type="text" className="step-title" value={step.title} onChange={(e) => updateStepTitle(si, e.target.value)} />
                            <select className="step-tag" value={step.tag} onChange={(e) => { const newTag = e.target.value; setSteps(prev => prev.map((s, i) => i === si ? { ...s, tag: newTag } : s)); }}>
                              {TAG_LABELS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="approvers-row">
                            {step.approvers.length === 0 && (
                              <div className="empty-slot">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                                No approvers assigned...
                              </div>
                            )}
                            <SortableContext items={step.approvers.map(a => a.id)} strategy={verticalListSortingStrategy}>
                              {step.approvers.map((a, ai) => (
                                <SortableApprover key={a.id} approver={a}>
                                  <div className="approver-chip" key={ai}>
                                    <div className={`approver-avatar avatar-${ai % 3}`}>{a.initials}</div>
                                    <div className="chip-info"><div className="chip-name">{a.name}</div><div className="chip-role">{a.role}</div></div>
                                    <button className="del-btn" onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeApprover(si, ai); }} title="Remove">
                                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M10 8v4M6 8v4M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                    </button>
                                  </div>
                                </SortableApprover>
                              ))}
                            </SortableContext>
                            <button className="add-approver-btn" onClick={() => openModal(si)}>
                              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
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

          <div className="add-step-wrap">
            <button className="add-step-btn" onClick={addStep}>
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Add Step
            </button>
          </div>

          <div className="approval-footer">
            <button className="discard-btn" onClick={discard}>Discard Changes</button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Saved successfully</span>}
              <button className="save-flow-btn" onClick={handleSave}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2h9l3 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" /><path d="M5 2v4h6V2M5 9h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                Save Flow Configuration
              </button>
            </div>
          </div>
        </>
      )}

      {modal !== null && (
        <div className="approval-modal-overlay" onClick={() => setModal(null)}>
          <div className="approval-modal" onClick={e => e.stopPropagation()}>
            <h4>Add approver to step {modal + 1}</h4>
            <select onChange={e => setModalName(e.target.value)} value={modalName}>
              <option value="">Select an account</option>
              {allAccs?.filter(a => !getUsedAccountIds(steps).includes(a._id)).map(a => (<option key={a._id} value={a._id}>{a.acc_fname}</option>))}
            </select>
            <input placeholder="Role / title" value={modalRole} onChange={e => setModalRole(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmAdd()} />
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


// ── Set Timer with full API integration ──────────────────────────────────────
const SetTimer = () => {
  const [timerHH, setTimerHH] = useState("10");
  const [timerMM, setTimerMM] = useState("00");
  const [timerStatus, setTimerStatus] = useState(null);
  const [timerMsg, setTimerMsg] = useState("");

  React.useEffect(() => {
    const fetchTimer = async () => {
      setTimerStatus("loading");
      try {
        const res = await axiosInstance.get("/api/timer/fetch");
        const timerData = res.data?.data;
        if (timerData) {
          const totalMins = timerData.totalMinutes ?? (timerData.hours * 60 + timerData.minutes);
          setTimerHH(String(Math.floor(totalMins / 60)).padStart(2, "0"));
          setTimerMM(String(totalMins % 60).padStart(2, "0"));
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.warn("Timer fetch error:", error?.response?.status);
        }
      } finally {
        setTimerStatus(null);
      }
    };
    fetchTimer();
  }, []);

  const handleTimerSave = async () => {
    setTimerStatus("saving");
    setTimerMsg("");
    const hh = Math.max(0, Math.min(23, parseInt(timerHH, 10) || 0));
    const mm = Math.max(0, Math.min(59, parseInt(timerMM, 10) || 0));
    const totalMinutes = hh * 60 + mm;
    try {
      const res = await axiosInstance.post("/api/timer/set", { hours: hh, minutes: mm, totalMinutes });
      if (res.status === 200 || res.status === 201) {
        setTimerStatus("saved");
        setTimerMsg("✓ Timer saved successfully");
      } else {
        setTimerStatus("error");
        setTimerMsg("Failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Timer save error:", error);
      setTimerStatus("error");
      setTimerMsg(error?.response?.data?.message || "Error saving timer.");
    } finally {
      setTimeout(() => { setTimerStatus(null); setTimerMsg(""); }, 3000);
    }
  };

  const handleHHChange = (e) => {
    const clamped = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
    setTimerHH(String(clamped).padStart(2, "0"));
  };

  const handleMMChange = (e) => {
    const clamped = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
    setTimerMM(String(clamped).padStart(2, "0"));
  };

  return (
    <div className="set-timer-section">
      <h4>Set Timer</h4>
      <p>Set a timer for reminders, session limits, or scheduled actions.</p>
      <div className="timer-row">
        <label className="timer-label">Set Time</label>
        <div className="timer-input-wrap">
          <div className={`timer-input-box ${timerStatus === "loading" ? "timer-loading" : ""}`}>
            <div className="timer-hhmm">
              <input type="number" min="0" max="23" value={timerHH} onChange={handleHHChange} disabled={timerStatus === "loading"} />
              <span className="timer-colon">:</span>
              <input type="number" min="0" max="59" value={timerMM} onChange={handleMMChange} disabled={timerStatus === "loading"} />
            </div>
            <span className="timer-clock-icon"><AccessTimeIcon /></span>
          </div>
          <span className="timer-hint">Select time in HH : MM format</span>
        </div>
      </div>
      <div className="timer-footer">
        <button
          className="dark-btn"
          onClick={handleTimerSave}
          disabled={timerStatus === "saving" || timerStatus === "loading"}
          style={{ opacity: (timerStatus === "saving" || timerStatus === "loading") ? 0.7 : 1, cursor: (timerStatus === "saving" || timerStatus === "loading") ? "not-allowed" : "pointer" }}
        >
          {timerStatus === "saving" ? "Saving…" : timerStatus === "loading" ? "Loading…" : "Save"}
        </button>
        {timerMsg && (
          <span className={timerStatus === "error" ? "timer-error-msg" : "timer-saved-msg"}>{timerMsg}</span>
        )}
      </div>
    </div>
  );
};


// ── Main Settings Component ──
const Settings = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [showMasters, setShowMasters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const storedUser = useSelector(state => state.auth.user) || {};
  const nameParts = storedUser.acc_fname ? storedUser.acc_fname.split(" ") : ["", ""];
  const [profile, setProfile] = useState({
    acc_fname: storedUser.acc_fname || "",
    acc_eml: storedUser.acc_eml || "",
    acc_phn: storedUser.acc_phn || "",
    acc_comp: storedUser.acc_comp || "",
    acc_plnt: storedUser.acc_plnt?._id || null,
    acc_dept: storedUser.acc_dept?._id || null,
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
    } catch (error) { console.error(error); }
  }, []);
  React.useEffect(() => { fetchMasters(); }, [fetchMasters]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === "acc_phn") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 10);
      setProfile(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axiosInstance.patch(`/api/acc/update?id=${storedUser._id}`, profile);
      if (response.status === 201) {
        dispatch(updateProfile({ data: response.data.data }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) { console.error(error); }
  };

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowMasters(false);
    setSidebarOpen(false);
  };

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
                  <div style={{ fontWeight: 600 }}>{profile.acc_fname}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{storedUser?.acc_typ?.typname}</div>
                </div>
              </div>
              <hr />
              <div className="form-grid">
                <div><label>Full Name</label><input name="acc_fname" value={profile.acc_fname} onChange={handleProfileChange} /></div>
                <div><label>Email Address</label><input name="acc_eml" value={profile.acc_eml} onChange={handleProfileChange} /></div>
                <div><label>Phone Number</label><input name="acc_phn" value={profile.acc_phn} onChange={handleProfileChange} /></div>
                <div><label>Company Name</label><input name="acc_comp" value={profile.acc_comp} onChange={handleProfileChange} /></div>
                <div>
                  <label>Default Plant</label>
                  <select name="acc_plnt" value={profile.acc_plnt} onChange={handleProfileChange}>
                    <option value="">Choose</option>
                    {plants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Department</label>
                  <select name="acc_dept" value={profile.acc_dept} onChange={handleProfileChange}>
                    <option value="">Choose</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <button className="dark-btn" onClick={handleSaveProfile}>Save Changes</button>
                {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Updated successfully</span>}
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
              <SetTimer />
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