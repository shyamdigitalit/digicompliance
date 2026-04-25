import React, { useState, useMemo, useEffect, useRef } from "react";
import "../styles/Document.css";
import axiosInstance from "../../config/axiosInstance";

const DOC_KEY = "document_data";

const defaultDocuments = [
  // { id: "DOC-001", name: "Fire Safety Certificate.pdf", type: "Certificate", category: "Health & Safety", plant: "Mumbai Plant A", uploadedBy: "John Smith", date: "2026-03-25", size: "2.4 MB" },
  // { id: "DOC-002", name: "ISO 9001 Audit Report.pdf", type: "Report", category: "Quality Management", plant: "Delhi Plant B", uploadedBy: "Sarah Johnson", date: "2026-03-24", size: "5.1 MB" },
  // { id: "DOC-003", name: "Env. Compliance Checklist.xlsx", type: "Checklist", category: "Environmental", plant: "Bangalore Plant C", uploadedBy: "Michael Chen", date: "2026-03-22", size: "2.8 MB" },
  // { id: "DOC-004", name: "Labor Law Form.docx", type: "Form", category: "Statutory", plant: "Mumbai Plant A", uploadedBy: "Michael Chen", date: "2026-03-23", size: "2.8 MB" },
  // { id: "DOC-005", name: "Safety Training Records.pdf", type: "Record", category: "Health & Safety", plant: "Delhi Plant B", uploadedBy: "Robert Wilson", date: "2026-03-18", size: "3.7 MB" },
];

const getFileIcon = (name) => {
  if (name.endsWith(".pdf")) return "📄";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "📊";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "📝";
  return "📁";
};

const Documents = () => {
  const [documents, setDocuments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DOC_KEY)) || defaultDocuments; }
    catch { return defaultDocuments; }
  });

<<<<<<< Updated upstream
  const [fileList, setFileList] = useState([]);
=======
  const [loading, setLoading] = useState(true);
>>>>>>> Stashed changes
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPlant, setFilterPlant] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

<<<<<<< Updated upstream
  const fetchFiles = React.useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/file/fetch");
      const files = res.data.files
      // console.log(files);
      setFileList(files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
=======
  // Simulate a brief load so the page feels consistent with other sections
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);
>>>>>>> Stashed changes

  useEffect(() => {
    localStorage.setItem(DOC_KEY, JSON.stringify(documents));
  }, [documents]);

  const types = useMemo(() => [...new Set(documents.map(d => d.type))], [documents]);
  const categories = useMemo(() => [...new Set(documents.map(d => d.category))], [documents]);
  const plants = useMemo(() => [...new Set(documents.map(d => d.plant))], [documents]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter(doc => {
      const matchSearch = !q || doc.name.toLowerCase().includes(q) || doc.uploadedBy.toLowerCase().includes(q);
      const matchType = !filterType || doc.type === filterType;
      const matchCat = !filterCategory || doc.category === filterCategory;
      const matchPlant = !filterPlant || doc.plant === filterPlant;
      return matchSearch && matchType && matchCat && matchPlant;
    });
  }, [documents, search, filterType, filterCategory, filterPlant]);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const addFiles = (files) => {
    const today = new Date().toISOString().split("T")[0];
    const newDocs = Array.from(files).map((file, i) => ({
      id: `DOC-${String(documents.length + i + 1).padStart(3, "0")}`,
      name: file.name,
      type: "Document",
      category: "General",
      plant: "Mumbai Plant A",
      uploadedBy: user.name || "Admin",
      date: today,
      size: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const handleFileChange = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this document?")) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const getTagClass = (type) => `tag ${type.toLowerCase()}`;

  const resetFilters = () => { setSearch(""); setFilterType(""); setFilterCategory(""); setFilterPlant(""); };

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

<<<<<<< Updated upstream
      <div className="table-container" style={{marginBottom:'2rem'}}>
        <div style={{padding:'2rem',fontSize:'1.5rem'}}>All Uploaded Files</div>
        <div className="doc-table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{textAlign:'center', textWrap:'nowrap'}}>Document Name</th>
                <th style={{textAlign:'center', textWrap:'nowrap'}}>File Type</th>
                <th>Size</th>
                <th style={{textAlign:'center', textWrap:'nowrap'}}>Uploaded On</th>
                <th style={{textAlign:'center', textWrap:'nowrap'}}>Uploaded By</th>
                {/* <th style={{textAlign:'center', textWrap:'nowrap'}}>Document Type</th> */}
                <th style={{textAlign:'center', textWrap:'nowrap'}}>Document Category</th>
                <th style={{textAlign:'center', textWrap:'nowrap'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fileList.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No documents found</td></tr>
              ) : fileList.map((doc) => (
                <tr key={doc._id}>
                  <td className="doc-name">{getFileIcon(doc.filename)} {doc.filename}</td>
                  <td>{doc.metadata.contentType}</td>
                  <td>{parseFloat(doc.length/1000).toFixed(2)} KB</td>
                  <td>{doc.date}</td>
                  <td>{doc.uploadedBy}</td>
                  {/* <td><span className={getTagClass(doc.type)}>{doc.type}</span></td> */}
                  <td>{doc.category}</td>
                  <td className="actions" style={{ display: "flex", gap: "8px" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px" }} title="Download">⬇</button>
                    <button onClick={() => handleDelete(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
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

      {/* <div className="filters" style={{
        width: "100%",
        padding:'1rem',
        margin:'0',
        backgroundColor: "#ffffff",
        borderTop: "1px solid #f1f5f9",
        fontSize: "12px",
        color: "#6b7280"
      }}>
        <input placeholder="Search documents or uploader..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterPlant} onChange={e => setFilterPlant(e.target.value)}>
          <option value="">All Plants</option>
          {plants.map(p => <option key={p}>{p}</option>)}
        </select>
        {(search || filterType || filterCategory || filterPlant) && (
          <button className="light-btn" onClick={resetFilters}>✕ Clear</button>
        )}
      </div> */}

      {/* <div className="table-container">
        <div className="doc-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Plant</th>
                <th>Uploaded By</th>
                <th>Upload Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No documents found</td></tr>
              ) : filtered.map((doc) => (
                <tr key={doc.id}>
                  <td className="doc-name">{getFileIcon(doc.name)} {doc.name}</td>
                  <td><span className={getTagClass(doc.type)}>{doc.type}</span></td>
                  <td>{doc.category}</td>
                  <td>{doc.plant}</td>
                  <td>{doc.uploadedBy}</td>
                  <td>{doc.date}</td>
                  <td>{doc.size}</td>
                  <td className="actions" style={{ display: "flex", gap: "8px" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px" }} title="Download">⬇</button>
                    <button onClick={() => handleDelete(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer" style={{ padding: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#6b7280" }}>
          {filtered.length} document{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div> */}
=======
          <div className="filters">
            <input placeholder="Search documents or uploader..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterPlant} onChange={e => setFilterPlant(e.target.value)}>
              <option value="">All Plants</option>
              {plants.map(p => <option key={p}>{p}</option>)}
            </select>
            {(search || filterType || filterCategory || filterPlant) && (
              <button className="light-btn" onClick={resetFilters}>✕ Clear</button>
            )}
          </div>

          <div className="table-container">
            <div className="doc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Plant</th>
                    <th>Uploaded By</th>
                    <th>Upload Date</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>
                        No documents found
                      </td>
                    </tr>
                  ) : filtered.map((doc) => (
                    <tr key={doc.id}>
                      <td className="doc-name">{getFileIcon(doc.name)} {doc.name}</td>
                      <td><span className={getTagClass(doc.type)}>{doc.type}</span></td>
                      <td>{doc.category}</td>
                      <td>{doc.plant}</td>
                      <td>{doc.uploadedBy}</td>
                      <td>{doc.date}</td>
                      <td>{doc.size}</td>
                      <td className="actions" style={{ display: "flex", gap: "8px" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px" }} title="Download">⬇</button>
                        <button onClick={() => handleDelete(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer" style={{ padding: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#6b7280" }}>
              {filtered.length} document{filtered.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </>
      )}
>>>>>>> Stashed changes
    </>
  );
};

export default Documents;