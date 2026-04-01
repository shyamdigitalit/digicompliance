import React from "react";
import "../../styles/compliance_modules/AddCompliance.css";
import FileUploader from "../../components/FileUploader";
import { useSelector } from "react-redux";
import axiosInstance from "../../config/axiosInstance";

export default function AddCompliance({
  onCancel,
  onSubmit,
  mode = "add",
  initialData = {}
}) {
  // console.log(initialData);
  const { user } = useSelector((state) => state.auth);
  // console.log(user);
  const isHierarchyThree = parseInt(user?.acc_typ?.heirarchy || 0) === 3;
  // console.log(isHierarchyThree);

  const { masters } = useSelector(state => state.master);
  // console.log(masters);
  const [files, setFiles] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [existingFiles, setExistingFiles] = React.useState([]);
  const [removedFileIds, setRemovedFileIds] = React.useState([]);


  React.useEffect(() => {
    if (initialData?.allDocs?.length) {
      setExistingFiles(initialData.allDocs);
    }
  }, [initialData]);

  // FileUploader inclusion
  // React.useEffect(() => {
  //   if (initialData?.allDocs?.length) {
  //     console.log(initialData.allDocs);
  //     setFiles(initialData.allDocs?.map(f => ({
  //       id: f._id,
  //       name: f.filName,
  //       size: f.filContentSize,
  //       type: f.filContentType,
  //       isExisting: true,
  //     })));
  //   }
  // }, [initialData]);

  const emptyForm = React.useMemo(() => ({
    complianceId: "",
    plant: null,
    department: null,
    complianceType: null,
    complianceCategorization: null,
    complianceFrequency: null,
    criticality: null,
    penaltyType: null,
    legislation: "",
    complianceHeader: "",
    complianceDescription: "",
    complianceApplicability: "",
    additionalInformation: "",
    provision: "",
    complianceStatutoryAuthority: "",
    complianceDate: "",
    location: "",
    scheduledPeriodicity: "",
    remarks: "",
  }), []);

  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    if (mode !== "add" && Object.keys(initialData).length) {
      setForm({
        complianceId: initialData?.complianceId || "",
        plant: initialData?.plant?._id || initialData?.plant || null,
        department: initialData?.department?._id || initialData?.department || null,
        complianceType: initialData?.complianceType?._id || initialData?.complianceType || null,
        complianceCategorization: initialData?.complianceCategorization?._id || initialData?.complianceCategorization || null,
        complianceFrequency: initialData?.complianceFrequency?._id || initialData?.complianceFrequency || null,
        criticality: initialData?.criticality?._id || initialData?.criticality || null,
        penaltyType: initialData?.penaltyType?._id || initialData?.penaltyType || null,
        legislation: initialData?.legislation || "",
        complianceHeader: initialData?.complianceHeader || "",
        complianceDescription: initialData?.complianceDescription || "",
        complianceApplicability: initialData?.complianceApplicability || "",
        additionalInformation: initialData?.additionalInformation || "",
        provision: initialData?.provision || "",
        complianceStatutoryAuthority: initialData?.complianceStatutoryAuthority || "",
        complianceDate: initialData?.complianceDate || "",
        location: initialData?.location || "",
        scheduledPeriodicity: initialData?.scheduledPeriodicity || "",
        remarks: initialData?.remarks || "",
      });
    }
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleRemoveExisting = (file) => {
    console.log(file);
    setExistingFiles(prev => prev.filter(f => f.filId !== file.filId));
    setRemovedFileIds(prev => [...prev, file.filId]);
  };

  const handleRemoveNew = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // const handleDownload = (file) => {
  //   // adjust URL if needed
  //   window.open(`/api/file/download/${file.filId}`, "_blank");
  // };
  const handleDownload = async (file) => {
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
  };


  const handleView = async (file) => {
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
};


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   try {
  //     console.log(files);
  //     const formData = new FormData();
  //     Object.entries(form).forEach(([k, v]) => formData.append(k, v));
  //     files.forEach(f => formData.append("allDocs", f));
  //     await onSubmit(formData);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  console.log(user)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!form.complianceType || !form.complianceCategorization || !form.complianceFrequency || !form.criticality || !form.penaltyType) {
      alert("Required fields are missing.");
      setIsSubmitting(false);
      return;
    }

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




    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      files.forEach(f => formData.append("allDocs", f));
      removedFileIds.forEach(id => formData.append("removedDocs", id));

      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const sortedExistingFiles = [...existingFiles].sort((a, b) =>
    a.filName.localeCompare(b.filName)
  );

  const sortedNewFiles = [...files].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="add-form">
      {/* FILE SECTION */}
      <div className="file-box">
        <h4>Documents</h4>

        {/* Existing Files */}
        {sortedExistingFiles.length > 0 && (
          <ul className="file-list">
            {sortedExistingFiles.map((file, index) => (
              <li key={index}>
                <span>📄 {file.filName}</span>

                <div className="file-actions">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => handleView(file)}
                  >
                    👁 View
                  </button>

                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => handleDownload(file)}
                  >
                    ⬇ Download
                  </button>


                  {mode !== "view" && (
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleRemoveExisting(file)}
                    >
                      ✖ Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Upload Section (Only for add/edit) */}
        {mode !== "view" && (
          <>
            <input
              type="file"
              multiple
              onChange={e => setFiles(Array.from(e.target.files))}
            />

            {sortedNewFiles.length > 0 && (
              <ul className="file-list" style={{ marginTop: "10px" }}>
                {sortedNewFiles.map((file, index) => (
                  <li key={index}>
                    <span>📎 {file.name}</span>

                    <div className="file-actions">
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleRemoveNew(index)}
                      >
                        ✖ Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>


      <div className="form-grid">
        <div className="form-group" style={{ display: (mode === "add") && "none" }}>
          <label>Compliance Id</label>
          <input
            name="complianceId"
            value={form.complianceId}
            onChange={handleChange}
            hidden={mode === "add"}
            readOnly={["view", "edit"].includes(mode)}
          />
        </div>

        <div className="form-group">
          <label>Plant</label>
          <select
            name="plant"
            id="plant"
            disabled={mode === "view" || isHierarchyThree || (user?.acc_plnt?._id)}
            value={form.plant}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.plant?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.plantCode}</option>)}
          </select>
          {!form.plant && <div className="error-message">Plant is required</div>}
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            name="department"
            id="department"
            disabled={mode === "view" || isHierarchyThree}
            value={form.department}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.department?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.departmentCode}</option>)}
          </select>
          {!form.department && <div className="error-message">Department is required</div>}
        </div>

        <div className="form-group">
          <label>Compliance Type</label>
          <select
            name="complianceType"
            id="complianceType"
            disabled={mode === "view"}
            value={form.complianceType}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.complianceType?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.complianceTypeName}</option>)}
          </select>
          {!form.complianceType && <div className="error-message">Compliance Type is required</div>}
        </div>

        <div className="form-group">
          <label>Compliance Categorization</label>
          <select
            name="complianceCategorization"
            id="complianceCategorization"
            disabled={mode === "view"}
            value={form.complianceCategorization}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.complianceCategory?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.complianceCategoryName}</option>)}
          </select>
          {!form.complianceCategorization && <div className="error-message">Compliance Categorization is required</div>}
        </div>

        <div className="form-group">
          <label>Compliance Frequency</label>
          <select
            name="complianceFrequency"
            id="complianceFrequency"
            disabled={mode === "view"}
            value={form.complianceFrequency}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.complianceFrequency?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.complianceFrequencyName}</option>)}
          </select>
          {!form.complianceFrequency && <div className="error-message">Compliance Frequency is required</div>}
        </div>

        <div className="form-group">
          <label>Criticality</label>
          <select
            name="criticality"
            id="criticality"
            disabled={mode === "view"}
            value={form.criticality}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.criticality?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.criticalityName}</option>)}
          </select>{!form.criticality && <div className="error-message">Criticality is required</div>}
        </div>

        <div className="form-group">
          <label>Penalty Type</label>
          <select
            name="penaltyType"
            id="penaltyType"
            disabled={mode === "view"}
            value={form.penaltyType}
            onChange={handleChange}
          >
            <option value="">Choose</option>
            {masters?.penalty?.map(elm => <option value={elm?._id} key={elm?._id}>{elm?.penaltyName}</option>)}
          </select>
          {!form.penaltyType && <div className="error-message">Penalty Type is required</div>}
        </div>

        <div className="form-group">
          <label>Compliance Date</label>
          <input
            type="date"
            name="complianceDate"
            value={form.complianceDate}
            onChange={handleChange}
            readOnly={mode === "view"}
          />
          {!form.complianceDate && (
            <div className="error-message">Compliance Date is required</div>
          )}
        </div>


        {Object.entries({
          legislation: "Legislation",
          complianceHeader: "Compliance Header",
          complianceDescription: "Compliance Description",
          complianceApplicability: "Compliance Applicability",
          additionalInformation: "Additional Information",
          provision: "Provision",
          complianceStatutoryAuthority: "Compliance Statutory Authority",
          location: "Location",
          scheduledPeriodicity: "Scheduled Periodicity",
          remarks: "Remarks",
        }).map(([key, label]) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input
              name={key}
              value={form[key]}
              onChange={handleChange}
              readOnly={mode === "view"}
            />
          </div>
        ))}

      </div>

      {/* <div className="form-grid">
        <FileUploader files={files} setFiles={setFiles} disabled={mode === "view"} />
      </div> */}

      <div className="form-actions">
        <button className="cancel" onClick={onCancel}>✖ Cancel</button>
        {mode !== "view" && (
          <>
            <button className="submit" onClick={handleSubmit}>✔ Submit</button>
            <button
              className="refresh"
              onClick={() => setForm(emptyForm)}
            >
              ⟳ Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}
