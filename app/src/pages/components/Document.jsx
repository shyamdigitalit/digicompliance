import React from "react";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import "../styles/Document.css";
import axiosInstance from "../../config/axiosInstance";
import Loader from "../../components/loader";
import { useSelector } from "react-redux";
import { logActivity } from "../utils/activityLog";
import { saveAs } from "file-saver";
import { useLocation } from "react-router-dom";

const defaultFileList = [];
const FUNCTION_CODE = "DOCUMENTS"
const COLLECTION_NAME = "files"

const getFileIcon = (name) => {
  if (!name) return "📄";
  if (name.endsWith(".txt")) return "📝";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "📘";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "📗";
  if (name.endsWith(".csv")) return "📊";
  if (name.endsWith(".pdf")) return "📑";
  if (name.endsWith(".webp") || name.endsWith(".png") || name.endsWith(".jpg")) return "🖼️";
  if (name.endsWith(".webm") || name.endsWith(".mp4")) return "🎬";
  return "📄";
};

// const isPdf = (name) => name?.toLowerCase().endsWith(".pdf");

const UploadPreview = React.memo(({ files, onRemove }) => (
  <div className="upload-preview">
    {files.map((f, idx) => (
      <div key={idx} className="upload-preview-item">
        <div className="filedetail-sec">{getFileIcon(f.name)} {f.name}</div>
        <div className="fileop-sec" onClick={() => onRemove(f)}>X</div>
      </div>
    ))}
  </div>
));

/* ── Compliance Picker Modal ── */
const CompliancePickerModal = React.memo(({ complianceList, onConfirm, onClose, uploading }) => {
  const [selected, setSelected] = React.useState("");
  // console.log(complianceList?.find(c => c._id === selected));
  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal" onClick={e => e.stopPropagation()}>
        <div className="doc-modal-header">
          <h3>Link to Compliance</h3>
          <button className="doc-modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="doc-modal-sub">Select the compliance record this document belongs to (optional).</p>
        <label className="doc-modal-label">Compliance ID</label>
        <select className="doc-modal-select" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">— No compliance (standalone) —</option>
          {complianceList.map(c => (
            <option key={c._id} value={c._id}>
              {c.complianceId}{c.plant?.name ? ` · ${c.plant.name}` : ""}
            </option>
          ))}
        </select>
        <div className="doc-modal-footer">
          <button className="light-btn" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="dark-btn" onClick={() => onConfirm(complianceList?.find(c => c._id === selected) || null)} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
});

/* ── PDF Viewer Modal ── */
const PdfViewerModal = React.memo(({ url, name, onClose }) => (
  <div className="doc-modal-overlay pdf-overlay" onClick={onClose}>
    <div className="pdf-modal" onClick={e => e.stopPropagation()}>
      <div className="doc-modal-header" style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "calc(100% - 40px)" }}>{name}</h3>
        <button className="doc-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="pdf-frame-wrap">
        <iframe src={url} title={name} className="pdf-frame" frameBorder="0" />
      </div>
    </div>
  </div>
));

/* ── Book page loader ── */
const BookLoader = ({ label = "Loading…" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem", gap: "0.5rem" }}>
    <div className="book-loader">
      <div>
        <ul>
          {[...Array(6)].map((_, i) => (
            <li key={i}>
              <svg fill="currentColor" viewBox="0 0 90 120">
                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
              </svg>
            </li>
          ))}
        </ul>
      </div>
      <span>{label}</span>
    </div>
  </div>
);

const Documents = React.memo(function Documents() {
  const location = useLocation()
  const [files, setFiles] = React.useState([]);
  const [fileList, setFileList] = React.useState(defaultFileList);
  const [loading, setLoading] = React.useState(true);
  const [dragOver, setDragOver] = React.useState(false);
  const [complianceList, setComplianceList] = React.useState([]);
  const [showCompliancePicker, setShowCompliancePicker] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadingFiles, setUploadingFiles] = React.useState(false);
  const [pdfViewer, setPdfViewer] = React.useState(null);
  const fileInputRef = React.useRef();

  const filterData = React.useCallback((data) => {
    const params = new URLSearchParams(location.search)
    // console.log(params);
    const logParams = String(params).split("=")[1]
    // console.log(logParams.length);

    const filteredData = logParams && data.some(elm => elm.filename===logParams)
    ? data.filter(elm => elm.filename===logParams) : data

    return filteredData
  }, [location.search])

  const fetchFiles = React.useCallback(async () => {
    try {
      // const params = new URLSearchParams(location.search)
      // console.log(params);
      // const logParams = String(params).split("=")[1]
      // console.log(logParams.length);
      const [res1, res2] = await Promise.allSettled([
        axiosInstance.get("/api/comp/fetch"),
        axiosInstance.get("/api/file/fetch")
      ]);
      const compliances = res1.value.data.data || []
      const allUnmappedFiles = res2.value.data.files || []
      // console.log(compliances);
      // console.log(allUnmappedFiles);
      const complianceMapping = compliances?.flatMap(c => c?.allDocs?.map(a => ({
        compId: c?._id,
        complianceId: c?.complianceId,
        ...a,
      })))

      const allFiles = allUnmappedFiles?.map(f => {
        const fMapped = complianceMapping?.find(cd => String(cd?._id)===String(f?._id))
        // console.log(fMapped);
        if (fMapped) {
          return {
            compId: fMapped?.compId,
            complianceId: fMapped?.complianceId,
            ...f
          }
        }
        else {
          return {
            compId: "",
            complianceId: "",
            ...f
          }
        }
      })
      const filteredFiles = filterData(allFiles)
      // console.log(filteredFiles);
      setFileList(filteredFiles || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [filterData]);

  const fetchCompliance = React.useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/comp/fetch");
      setComplianceList(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    Promise.all([fetchFiles(), fetchCompliance()]).finally(() => setLoading(false));
  }, [fetchFiles, fetchCompliance]);

  const addFiles = React.useCallback((f) => setFiles(prev => [...prev, ...Array.from(f)]), []);
  const handleRemoveFile = React.useCallback((file) => setFiles(prev => prev.filter(f => f !== file)), []);
  const handleFileChange = React.useCallback((e) => addFiles(e.target.files), [addFiles]);
  const handleDrop = React.useCallback(async (e) => {
    e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleUploadClick = React.useCallback(() => {
    if (files.length === 0) { alert("Please select files first."); return; }
    setShowCompliancePicker(true);
  }, [files]);

  /* FIX: await fetchFiles() so list updates BEFORE loader disappears */
  const handleConfirmUpload = React.useCallback(async (complianceData) => {
    setUploading(true);
    setUploadingFiles(true);
    // console.log(complianceData);
    const compid = complianceData?._id 
    let compliancePayload = {
      plant: "",
      department: "",
      complianceType: "",
      complianceCategorization: "",
      complianceFrequency: "",
      criticality: "",
      penaltyType: "",
      dueDate: null,
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
    }
    const formData = new FormData();

    try {
      if (complianceData) {
        Object.assign(compliancePayload, {
          plant: complianceData?.plant?._id || "",
          department: complianceData?.department?._id || "",
          complianceType: complianceData?.complianceType?._id || "",
          complianceCategorization: complianceData?.complianceCategorization?._id || "",
          complianceFrequency: complianceData?.complianceFrequency?._id || "",
          criticality: complianceData?.criticality?._id || "",
          penaltyType: complianceData?.penaltyType?._id || "",
          dueDate: complianceData?.dueDate || null,
          legislation: complianceData?.legislation || "",
          complianceHeader: complianceData?.complianceHeader || "",
          complianceDescription: complianceData?.complianceDescription || "",
          complianceApplicability: complianceData?.complianceApplicability || "",
          additionalInformation: complianceData?.additionalInformation || "",
          provision: complianceData?.provision || "",
          complianceStatutoryAuthority: complianceData?.complianceStatutoryAuthority || "",
          location: complianceData?.location || "",
          scheduledPeriodicity: complianceData?.scheduledPeriodicity || "",
          remarks: complianceData?.remarks || "",
        })
        Object.entries(compliancePayload).forEach(([key, value]) => {
          formData.append(key, value ?? "");
        });
        files.forEach((file) => formData.append("allDocs", file));
        await axiosInstance.patch(`/api/comp/update?id=${compid}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      else {
        files.forEach((file) => formData.append("files", file));
        await axiosInstance.post(`/api/file/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      // await axiosInstance.patch(`/api/comp/update?id=${compid}`, formData, {
      //   headers: { "Content-Type": "multipart/form-data" }
      // });
      // logActivity("Document Uploaded", files.map(f => f.name).join(", "), user);
      logActivity("Document Uploaded", "", FUNCTION_CODE, COLLECTION_NAME, "filename", files.map(f => f.name).join(", "), "");
      setFiles([]);
      setShowCompliancePicker(false);
      // Await fetchFiles so the list is populated before the loader hides
      await fetchFiles();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
      setUploadingFiles(false);
    }
  }, [files, fetchFiles]);

  const handleDownloadAll = React.useCallback(async () => {
    if (!fileList.length) { alert("No documents to download."); return; }
    try {
      const fileIds = fileList.map(f => f._id).join(",");
      const res = await axiosInstance.get(`/api/file/downloadall?files=${fileIds}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/zip" });
      saveAs(blob, "All_Documents.zip");
      // logActivity("All Documents Downloaded", `${fileList.length} files`, user);
      logActivity("All Documents Downloaded", "", FUNCTION_CODE, COLLECTION_NAME, "", "", `${fileList.length} files`);
    } catch (err) {
      console.error("Download all error:", err);
      alert("Failed to download all documents. Please try again.");
    }
  }, [fileList]);

  const handleDownload = React.useCallback(async (file) => {
    try {
      const res = await axiosInstance.get(`/api/file/download/${file._id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.filename || "file";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      // logActivity("Document Downloaded", file.filename || file._id, user);
      logActivity("Document Downloaded", "", FUNCTION_CODE, COLLECTION_NAME, "filename", file.filename, "");
    } catch (err) {
      console.error("Download error:", err);
    }
  }, []);

  // const handleViewPdf = React.useCallback(async (file) => {
  //   try {
  //     const res = await axiosInstance.get(`/api/file/download/${file._id}`, { responseType: "blob" });
  //     const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/pdf" });
  //     const url = window.URL.createObjectURL(blob);
  //     setPdfViewer({ url, name: file.filename || "Document" });
  //   } catch (err) {
  //     console.error("View error:", err);
  //     alert("Could not open document.");
  //   }
  // }, []);

  const closePdfViewer = React.useCallback(() => {
    if (pdfViewer?.url) window.URL.revokeObjectURL(pdfViewer.url);
    setPdfViewer(null);
  }, [pdfViewer]);

  return (
    <>
      <div className="doc-header">
        <h2>Documents</h2>
        <p>Manage compliance documents and files</p>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="upload-section">
            {files.length > 0 && <UploadPreview files={files} onRemove={handleRemoveFile} />}

            {uploadingFiles ? (
              <BookLoader label="Uploading documents…" />
            ) : (
              <>
                <div
                  className={`upload-box${dragOver ? " drag-over" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef} type="file" multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.webp,.webm,.mp4"
                  />
                  <div className="upload-content">
                    <p>Click to upload or drag and drop</p>
                    <span>PDF, DOC, DOCX, XLS, XLSX (Max 50MB)</span>
                  </div>
                </div>
                <div>
                  <button className="dark-btn" onClick={handleUploadClick}>Upload Documents</button>
                </div>
              </>
            )}
          </div>

          <div className="table-container" style={{ marginBottom: "2rem" }}>
            <div style={{ padding: "2rem 2rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "1.5rem" }}>All Uploaded Files</div>
              <button
                className="dark-btn"
                onClick={handleDownloadAll}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FolderZipOutlinedIcon fontSize="small" />
                Download All
              </button>
            </div>
            <div className="doc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Compliance ID</th>
                    <th>Size</th>
                    <th>Uploaded On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fileList.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>
                        No documents found
                      </td>
                    </tr>
                  ) : fileList.map((doc) => (
                    <tr key={doc._id}>
                      <td className="doc-name" title={doc.filename}>{getFileIcon(doc.filename)} {doc.filename}</td>
                      <td>{doc.complianceId || "N/A"}</td>
                      <td>{parseFloat(doc.size / 1000).toFixed(2)} KB</td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="actions" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                        <button
                          className="action-icon-btn download"
                          title="Download"
                          onClick={() => handleDownload(doc)}
                        >
                          <FileDownloadOutlinedIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#6b7280" }}>
              {fileList.length} document{fileList.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </>
      )}

      {showCompliancePicker && (
        <CompliancePickerModal
          complianceList={complianceList}
          onConfirm={handleConfirmUpload}
          onClose={() => !uploading && setShowCompliancePicker(false)}
          uploading={uploading}
        />
      )}

      {pdfViewer && (
        <PdfViewerModal url={pdfViewer.url} name={pdfViewer.name} onClose={closePdfViewer} />
      )}
    </>
  );
});

export default Documents;
