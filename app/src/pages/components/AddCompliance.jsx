import React from "react";
import "../styles/AddCompliance.css";
import { useSelector } from "react-redux";
import axiosInstance from '../../config/axiosInstance';

const AddCompliance = React.memo(function AddCompliance({ onCancel, onSubmit, mode = 'add', initialData, saved, masterData }) {

  const { user } = useSelector((state) => state.auth);
  const isHierarchyThree = parseInt(user?.acc_typ?.heirarchy || 0) === 3;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const [existingFiles, setExistingFiles] = React.useState([]);
  const [removedFileIds, setRemovedFileIds] = React.useState([]);


  const [form, setForm] = React.useState({
    // complianceId: "",
    plant: "",
    department: "",
    complianceType: "",
    complianceCategorization: "",
    complianceFrequency: "",
    criticality: "",
    penaltyType: "",
    dueDate: "",
    legislation: "",
    complianceHeader: "",
    complianceDescription: "",
    complianceApplicability: "",
    additionalInformation: "",
    provision: "",
    complianceStatutoryAuthority: "",
    location: "",
    scheduledPeriodicity: "",
    remarks: "",
    // allDocs: []
  });

  const PLANTS = masterData.plants || [];
  const DEPARTMENTS = masterData.departments || [];
  const COMPLIANCE_TYPES = masterData.complianceTypes || [];
  const CATEGORIES = masterData.complianceCategories || [];
  const FREQUENCIES = masterData.complianceFrequencies || [];
  const CRITICALITIES = masterData.criticalities || [];
  const PENALTY_TYPES = masterData.penaltyTypes || [];

  React.useEffect(() => {
    if (initialData?.allDocs?.length) {
      setExistingFiles(initialData.allDocs);
    }
  }, [initialData]);

  React.useEffect(() => {
    // console.log(mode);
    // console.log(initialData);
    if (initialData) {
      setForm({
        plant: initialData?.plant?._id || null,
        department: initialData?.department?._id || null,
        complianceType: initialData?.complianceType?._id || null,
        complianceCategorization: initialData?.complianceCategorization?._id || null,
        complianceFrequency: initialData?.complianceFrequency?._id || null,
        criticality: initialData?.criticality?._id || null,
        penaltyType: initialData?.penaltyType?._id || null,
        dueDate: initialData?.dueDate,
        legislation: initialData?.legislation || "",
        complianceHeader: initialData?.complianceHeader || "",
        complianceDescription: initialData?.complianceDescription || "",
        complianceApplicability: initialData?.complianceApplicability || "",
        additionalInformation: initialData?.additionalInformation || "",
        provision: initialData?.provision || "",
        complianceStatutoryAuthority: initialData?.complianceStatutoryAuthority || "",
        location: initialData?.location || "",
        scheduledPeriodicity: initialData?.scheduledPeriodicity || "",
        remarks: initialData?.remarks || "",
      })
    };
  }, [initialData])


  // File Options
  const handleRemoveExisting = React.useCallback((file) => {
    // console.log(file);
    setExistingFiles(prev => prev.filter(f => f.filId !== file.filId));
    setRemovedFileIds(prev => [...prev, file.filId]);
  }, [setExistingFiles, setRemovedFileIds]);

  const handleRemoveNew = React.useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, [setFiles]);

  const sortedExistingFiles = React.useMemo(() => {
    return [...existingFiles].sort((a, b) =>
      a.filName.localeCompare(b.filName)
    );
  }, [existingFiles]);
  const sortedNewFiles = React.useMemo(() => {
    return [...files].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [files]);

  const handleDownload = React.useCallback(async (file) => {
    try {
      const res = await axiosInstance.get(`/api/file/download/${file.filId}`, { responseType: "blob" });

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || file.filContentType
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.filName;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
    }
  }, []);

  const handleView = React.useCallback(async (file) => {
    try {
      const res = await axiosInstance.get(
        `/api/file/download/${file.filId}`,
        { responseType: "blob" }
      );

      const contentType = res.headers["content-type"];

      const blob = new Blob([res.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);

      window.open(url);

    } catch (err) {
      console.error("View error:", err);
    }
  }, []);


  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, [setFiles]);

  // const handleFiles = (e) => {
  //   const files = Array.from(e.target.files);
  //   setForm(prev => ({ ...prev, allDocs: files }));
  //   // For preview purposes, you can create object URLs for the files
  //   // const filePreviews = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
  //   // setForm(prev => ({ ...prev, allDocs: filePreviews }));
  // };

  const handleSubmit = React.useCallback((e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (!isHierarchyThree && !user?.acc_plnt && !form.plant) {
      alert("Plant is required for your user role.");
      setIsSubmitting(false);
      return;
    }
    if (!isHierarchyThree && !user?.acc_dept && !form.department) {
      alert("Department is required for your user role.");
      setIsSubmitting(false);
      return;
    }
    if (!form.complianceType || !form.complianceCategorization || !form.complianceFrequency || !form.criticality || !form.penaltyType) {
      alert("Required fields are missing.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      // ✅ append normal fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      // ✅ append NEW files
      files.forEach(file => {
        formData.append("allDocs", file);
      });

      // ✅ append removed existing file IDs (IMPORTANT)
      removedFileIds.forEach(id => {
        formData.append("removedDocs[]", id);
      });

      onSubmit(formData);
    } catch (error) {
      console.error(error);
    }
  }, [form, files, removedFileIds, onSubmit, isHierarchyThree, isSubmitting, user]);

  React.useEffect(() => {
    if (isHierarchyThree) {
      setForm(p => ({
        ...p,
        plant: user?.plant?._id || p.plant,
        department: user?.department?._id || p.department
      }));
    }
    else {
      if (user?.acc_plnt?._id) {
        setForm(p => ({
          ...p,
          plant: user?.acc_plnt?._id || p.plant
        }));
      }
    }
  }, [isHierarchyThree, user]);

  return (
    <div className="add-page">
      <div className="header">
        <div>
          <h2>Add Compliance</h2>
          <p>Create and manage compliance records</p>
        </div>
      </div>

      <div className="form-card">
        {/* SECTION 1 */}
        <div className="section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Plant *</label>
              {(mode === "add" && user?.acc_plnt?.name) ? (
                <input value={user?.acc_plnt?.name} disabled />
              ) : (
                <select name="plant" value={form.plant}
                  disabled={mode === "view" || isHierarchyThree || (user?.acc_plnt?._id)}
                  onChange={handleChange}
                >
                  <option value="">Select Plant</option>
                  {PLANTS.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Department *</label>
              {(mode === "add" && user?.acc_dept?.name) ? (
                <input value={user?.acc_dept?.name} disabled />
              ) : (
                <select name="department" value={form.department}
                  disabled={mode === "view" || isHierarchyThree}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Compliance Type *</label>
              <select name="complianceType" value={form.complianceType} onChange={handleChange}>
                <option value="">Select Type</option>
                {COMPLIANCE_TYPES.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Category</label>
              <select name="complianceCategorization" value={form.complianceCategorization} onChange={handleChange}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Compliance Frequency</label>
              <select name="complianceFrequency" value={form.complianceFrequency} onChange={handleChange}>
                <option value="">Select Frequency</option>
                {FREQUENCIES.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Criticality</label>
              <select name="criticality" value={form.criticality} onChange={handleChange}>
                <option value="">Select Criticality</option>
                {CRITICALITIES.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Penalty Type</label>
              <select name="penaltyType" value={form.penaltyType} onChange={handleChange}>
                <option value="">Select Penalty Type</option>
                {PENALTY_TYPES.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Legislation</label>
              <input name="legislation" value={form.legislation} onChange={handleChange} placeholder="e.g. Factories Act 1948" />
            </div>
            <div className="form-group">
              <label>Compliance Header</label>
              <input name="complianceHeader" value={form.complianceHeader} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Compliance Description</label>
              <input name="complianceDescription" value={form.complianceDescription} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Compliance Applicability</label>
              <input name="complianceApplicability" value={form.complianceApplicability} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Additional Information</label>
              <input name="additionalInformation" value={form.additionalInformation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Provision</label>
              <input name="provision" value={form.provision} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Statutory Authority</label>
              <input name="complianceStatutoryAuthority" value={form.complianceStatutoryAuthority} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Scheduled Periodicity</label>
              <input name="scheduledPeriodicity" value={form.scheduledPeriodicity} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="section">
          <h3>Remarks</h3>
          <div className="form-group full">
            <label>Details</label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="4" />
          </div>
        </div>

        {/* FILE UPLOAD */}
        <div className="section">
          <h3>Documents</h3>
          <div className="doc-zone">

            {/* Existing Files */}
            {sortedExistingFiles.length > 0 && (
              <>
                <div className="doc-zone-header">
                  <span className="doc-zone-title">Existing documents</span>
                  <span className="doc-count">{sortedExistingFiles.length} file{sortedExistingFiles.length !== 1 ? 's' : ''}</span>
                </div>
                {sortedExistingFiles.map((file, index) => (
                  <div className="file-row" key={index}>
                    <div className="file-icon">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1z" />
                        <polyline points="9,1 9,5 13,5" />
                      </svg>
                    </div>
                    <div className="file-info">
                      <span className="file-name">{file.filName}</span>
                      <span className="file-meta">{file.filContentType}</span>
                    </div>
                    <div className="file-btns">
                      <button type="button" className="icon-btn" onClick={() => handleView(file)}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="8" cy="8" r="3" /><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
                        </svg>
                        View
                      </button>
                      <button type="button" className="icon-btn" onClick={() => handleDownload(file)}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 2v9m-4-4 4 4 4-4" /><rect x="2" y="13" width="12" height="1.5" rx="0.5" />
                        </svg>
                        Download
                      </button>
                      {mode !== "view" && (
                        <button type="button" className="icon-btn danger" onClick={() => handleRemoveExisting(file)}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* New Uploads */}
            {mode !== "view" && (
              <>
                <div className="doc-zone-header" style={{ borderTop: sortedExistingFiles.length > 0 ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
                  {/* <span className="doc-zone-title">New uploads</span> */}
                  {sortedNewFiles.length > 0 && (
                    <span className="doc-count">{sortedNewFiles.length} queued</span>
                  )}
                </div>

                {sortedNewFiles.map((file, index) => (
                  <div className="file-row" key={index}>
                    <div className="file-icon new">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1z" />
                        <polyline points="9,1 9,5 13,5" />
                      </svg>
                    </div>
                    <div className="file-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="file-name">{file.name}</span>
                        <span className="new-badge">new</span>
                      </div>
                      <span className="file-meta">{(file.size / 1024).toFixed(0)} KB</span>
                    </div>
                    <div className="file-btns">
                      <button type="button" className="icon-btn danger" onClick={() => handleRemoveNew(index)}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="upload-area">
                  <label className="upload-trigger">
                    <div className="upload-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 10V3m-3 3 3-3 3 3" /><path d="M3 13h10" />
                      </svg>
                    </div>
                    <div>
                      <div className="upload-label"><span>Click to upload</span> or drag and drop</div>
                      <div className="upload-hint">Any file type — PDF, Word, Excel, images</div>
                    </div>
                    <input type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => {
                      const newFiles = Array.from(e.target.files);
                      setFiles(prev => [...prev, ...newFiles]);
                    }}
                    />
                  </label>
                </div>
              </>
            )}

          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button className="light-btn" onClick={onCancel}>Cancel</button>
          {(saved && mode === 'add') && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Created! Redirecting…</span>}
          {(saved && mode === 'edit') && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Updated! Redirecting…</span>}
          <button className="dark-btn" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
});

export default AddCompliance;