import React, { useState, useMemo, useEffect, useRef } from "react";
import "../styles/Document.css";
import axiosInstance from "../../config/axiosInstance";

const DOC_KEY = "document_data";

const defaultFileList = [];

const getFileIcon = (name) => {
  if (name.endsWith(".txt")) return "📝";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "📘";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "📗";
  if (name.endsWith(".csv")) return "📊";
  if (name.endsWith(".pdf")) return "📑";
  if (name.endsWith(".webp")) return "🖼️";
  if (name.endsWith(".png")) return "🖼️";
  if (name.endsWith(".jpg")) return "🖼️";
  if (name.endsWith(".webm")) return "🎬";
  return "📄";
};

const UploadPreview = React.memo(({ files, onRemove }) => {
  return (
    <div className="upload-preview">
      {files.map((f, idx) => (
        <div key={idx} className="upload-preview-item">
          <div className="filedetail-sec">{getFileIcon(f.name)} {f.name}</div>
          <div className="fileop-sec" onClick={() => onRemove(f)}>X</div>
        </div>
      ))}
    </div>
  );
});

const Documents = () => {
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState(defaultFileList);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const fetchFiles = React.useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/file/fetch");
      const files = res.data.files
      setFileList(files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Simulate a brief load so the page feels consistent with other sections
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   localStorage.setItem(DOC_KEY, JSON.stringify(documents));
  // }, [documents]);

  // const types = useMemo(() => [...new Set(documents.map(d => d.type))], [documents]);
  // const categories = useMemo(() => [...new Set(documents.map(d => d.category))], [documents]);
  // const plants = useMemo(() => [...new Set(documents.map(d => d.plant))], [documents]);

  // const filtered = useMemo(() => {
  //   const q = search.toLowerCase();
  //   return documents.filter(doc => {
  //     const matchSearch = !q || doc.name.toLowerCase().includes(q) || doc.uploadedBy.toLowerCase().includes(q);
  //     const matchType = !filterType || doc.type === filterType;
  //     const matchCat = !filterCategory || doc.category === filterCategory;
  //     const matchPlant = !filterPlant || doc.plant === filterPlant;
  //     return matchSearch && matchType && matchCat && matchPlant;
  //   });
  // }, [documents, search, filterType, filterCategory, filterPlant]);

  // const user = JSON.parse(localStorage.getItem("user")) || {};

  const addFiles = (files) => {
    console.log(files);
    const newFiles = Array.from(files)
    setFiles(prev => [...prev, ...newFiles]);
  };
  const handleRemoveFile = (file) => {
    setFiles(prev => prev.filter(f => f !== file));
  }

  const handleFileChange = (e) => addFiles(e.target.files);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    // console.log(files);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await axiosInstance.post("/api/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      console.log(response);
    }
    catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload files. Please try again.");
    }
  };

  const handleDownload = async (file) => {
    try {
      console.log(file);
      const res = await axiosInstance.get(`/api/file/download/${file._id}`, { responseType: "blob" });

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || file.metadata.contentType || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename || "Unknown_file";

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
    }
  };

  // const handleDelete = (id) => {
  //   if (window.confirm("Delete this document?")) {
  //     setDocuments(prev => prev.filter(d => d.id !== id));
  //   }
  // };

  // const getTagClass = (type) => `tag ${type.toLowerCase()}`;
  // const resetFilters = () => { setSearch(""); setFilterType(""); setFilterCategory(""); setFilterPlant(""); };

  return (
    <>
      <div className="doc-header">
        <h2>Documents</h2>
        <p>Manage compliance documents and files</p>
      </div>

      {loading ? (
        <div className="loader-overlay" role="status" aria-label="Loading documents">
          <div className="loader">
            <span className="loader__dot"></span>
            <span className="loader__dot"></span>
            <span className="loader__dot"></span>
          </div>
        </div>
      ) : (
        <>
          <div className="upload-section">
            {files.length > 0 ? <UploadPreview files={files} onRemove={handleRemoveFile} /> : null }
            <div
              className={`upload-box${dragOver ? " drag-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
              <div className="upload-content">
                <div className="upload-icon">⬆</div>
                <p>Click to upload or drag and drop</p>
                <span>PDF, DOC, DOCX, XLS, XLSX (Max 50MB)</span>
              </div>
            </div>
            <div>
              <button className="dark-btn" onClick={handleUpload}>Upload</button>
            </div>
          </div>

          <div className="table-container" style={{marginBottom:'2rem'}}>
            <div style={{padding:'2rem',fontSize:'1.5rem'}}>All Uploaded Files</div>
            <div className="doc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="text-nowrap">Document Name</th>
                    <th className="text-nowrap">File Type</th>
                    <th className="text-nowrap">Size</th>
                    <th className="text-nowrap">Uploaded On</th>
                    <th className="text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fileList.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No documents found</td></tr>
                  ) : fileList.map((doc) => (
                    <tr key={doc._id}>
                      <td className="doc-name">{getFileIcon(doc.filename)} {doc.filename}</td>
                      <td>{doc.mimetype}</td>
                      <td>{parseFloat(doc.size/1000).toFixed(2)} KB</td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="actions" style={{ display: "flex", justifyContent:'center', alignItems:'center', gap: "8px" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px" }} title="Download" onClick={() => handleDownload(doc)}>⬇</button>
                        {/* <button onClick={() => handleDelete(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer" style={{ padding: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#6b7280" }}>
              {fileList.length} document{fileList.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Documents;