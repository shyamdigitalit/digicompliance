import React from 'react'
import axiosInstance from '../../../config/axiosInstance';
import Loader from '../../../components/loader';
import { generateAbbreviation } from '../../../utilities/genAbbreviation';
import { AxiosError } from 'axios';
import { DndContext, KeyboardSensor, PointerSensor, useDroppable, pointerWithin } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

let DEFAULT_STEPS = [];
const TAG_LABELS = ["Minimum 1 approver", "Quorum required", "Executive signature", "All must approve"];

const SortableStep = React.memo(function SortableStep({ step, si, children, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    console.log(si);
    
    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="action-pane" style={{ display:'flex' }}>
                <div {...listeners} style={{ backgroundColor:'#5b9aec', padding:'0.5rem', color:'#ffffffff', borderRadius:'0.2rem 0.2rem 0 0', cursor:"grab" }}>⠿</div>
                <div style={{ backgroundColor:'#fa405f', padding:'0.5rem', color:'#ffffffff', borderRadius:'0.2rem 0.2rem 0 0', cursor:"pointer" }} onClick={onRemove}>X</div>
            </div>
            {children}
        </div>
    );
});

const DroppableStep = React.memo(function DroppableStep({ step, children }) {
    const { setNodeRef } = useDroppable({ id: step.id });
    return <div ref={setNodeRef}>{children}</div>;
});

const SortableApprover = React.memo(function SortableApprover({ approver, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: approver.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div {...listeners} style={{ cursor: "grab" }}>⠿</div>
            {children}
        </div>
    );
});

const ApprovalFlow = React.memo(function ApprovalFlow() {
    const [plants, setPlants] = React.useState([]);
    const [departments, setDepartments] = React.useState([]);
    const [activePlntTab, setActivePlntTab] = React.useState(0);
    const [activeDeptTab, setActiveDeptTab] = React.useState(0);
    const [steps, setSteps] = React.useState([...DEFAULT_STEPS]);
    const [modal, setModal] = React.useState(null);
    const [allAccs, setAllAccs] = React.useState([]);
    const [modalName, setModalName] = React.useState({});
    const [modalRole, setModalRole] = React.useState("");
    const [saved, setSaved] = React.useState(false);
    const [error, setError] = React.useState({ status: false, log: '' });
    const [loading, setLoading] = React.useState(false);

    const fetchMasters = React.useCallback(async () => {
        try {
            const [plantsRes, deptsRes] = await Promise.all([
                axiosInstance.get("/api/plnt/fetch"),
                axiosInstance.get("/api/dept/fetch")
            ]);
            setPlants(plantsRes.data.data || []);
            setDepartments(deptsRes.data.data || []);
        }
        catch (error) { console.error(error); }
    }, [setPlants, setDepartments]);
    React.useEffect(() => { fetchMasters(); }, [fetchMasters]);

    const fetchApprovalFlow = React.useCallback(async () => {
        try {
            const cbase = plants[activePlntTab]?._id;
            const fnid = departments[activeDeptTab]?._id;
            if (!cbase || !fnid) return;
            setLoading(true);
            setSteps([]);
            const res = await axiosInstance.get("/api/dynapprvl/fetch", { params: { cbase, fnid } });
            const record = res.data.data;
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
            }
            else { setSteps([]); }
        }
        catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [plants, departments, activePlntTab, activeDeptTab, setSteps, setLoading]);
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
        }
        catch (error) { console.error(error); }
    }, [plants, departments, activePlntTab, activeDeptTab, setAllAccs]);
    React.useEffect(() => { fetchAllAccounts(); }, [fetchAllAccounts]);

    const getUsedAccountIds = React.useCallback((stepsData) => stepsData.flatMap(s => s.approvers.map(a => a.id)), []);

    const removeApprover = (si, ai) =>
        setSteps(prev => prev.map((s, i) => i === si ? { ...s, approvers: s.approvers.filter((_, j) => j !== ai) } : s));

    const openModal = (si) => { setModalName(""); setModalRole(""); setModal(si); };

    const confirmAdd = React.useCallback(() => {
        if (!modalName.trim()) return;
        const usedIds = getUsedAccountIds(steps);
        if (usedIds.includes(modalName)) { alert("This account is already assigned in this flow."); return; }
        const accDetails = allAccs.find(a => a._id === modalName);
        const initials = accDetails?.acc_fname.trim().split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase();
        setSteps(prev => prev.map((s, i) => i === modal ? { ...s, approvers: [...s.approvers, { initials, id: accDetails?._id, name: accDetails?.acc_fname.trim(), role: modalRole.trim() || "Team Member" }] } : s));
        setModal(null);
    }, [modalName, getUsedAccountIds, allAccs, modal, modalRole, steps]);

    const addStep = () => {
        const n = steps.length + 1;
        setSteps(prev => [...prev, { id: `step-${crypto.randomUUID()}`, title: `Step ${n}`, tag: TAG_LABELS[n % TAG_LABELS.length], approvers: [] }]);
    };
    const removeSteps = (id) => {
        console.log(id);
        // const neSteps = steps.filter((prev) => id !== prev.id )
        // console.log(neSteps);
        setSteps(prev => prev.filter((s) => id !== s.id ))
    }

    const discard = () => setSteps([...DEFAULT_STEPS]);
    const updateStepTitle = (si, title) => setSteps(prev => prev.map((s, i) => i === si ? { ...s, title } : s));

    const handleSave = async () => {
        let response
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
            response = await axiosInstance.post(`/api/dynapprvl/create`, dynapprvlPayld);
            // console.log(response);
            if (response.status === 201) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
            else { setError({ ...error, status: true, log: response}); setTimeout(() => setError(false), 2500)}
        }
        catch (error) {
            console.error(error)
        }
    };

    const findContainer = React.useCallback((id) => {
        if (steps.find(s => s.id === id)) return id;
        for (const step of steps) { if (step.approvers.some(a => a.id === id)) return step.id; }
        return null;
    }, [steps]);

    const handleDragEnd = React.useCallback(({ active, over }) => {
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
    }, [findContainer, steps, setSteps]);

  return (
    <div className="profile-card approval-card">
        <h3>Dynamic Approval Flow</h3>
        <div className="approval-tabs plnt-tabs">
            {plants.map((t, i) => (
                <button
                key={t?._id}
                className={`approval-tab ${activePlntTab === i ? "active" : ""}`}
                onClick={() => { setActivePlntTab(i); setSteps([]); }}
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
                onClick={() => { setActiveDeptTab(i); setSteps([]); }}
                >
                    {t?.name}
                </button>
            ))}
        </div>

        { loading ? <Loader /> : (
            <>
            <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="approval-steps">
                    {steps.map((step, si) => (
                    <DroppableStep key={step.id} step={step}>
                        <SortableStep key={step.id || si} step={step} si={si} onRemove={() => removeSteps(step.id)}>
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
  )
})

export default ApprovalFlow