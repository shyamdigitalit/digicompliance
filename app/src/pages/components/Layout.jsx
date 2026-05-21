import React, { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FileOpenOutlinedIcon  from '@mui/icons-material/FileOpenOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon  from '@mui/icons-material/SettingsOutlined';
import LogoutIcon            from '@mui/icons-material/Logout';
import PersonOutlineIcon     from '@mui/icons-material/PersonOutline';
import SearchIcon            from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import logo from "../../assets/logo.png";
import "../styles/Dashboard.css";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../config/axiosInstance";

const navItems = [
  { path: "/dashboard",  label: "Dashboard",  icon: <DashboardOutlinedIcon /> },
  { path: "/compliance", label: "Compliance", icon: <FileOpenOutlinedIcon /> },
  { path: "/document",   label: "Documents",  icon: <TextSnippetOutlinedIcon /> },
  { path: "/user",       label: "Users",      icon: <PeopleAltOutlinedIcon /> },
  { path: "/setting",    label: "Settings",   icon: <SettingsOutlinedIcon /> },
];

const getFileIcon = (name) => {
  if (!name) return "📄";
  if (name.endsWith(".pdf")) return "📑";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "📘";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "📗";
  return "📄";
};

const isPdf = (name) => name?.toLowerCase().endsWith(".pdf");

/* ── View Docs Panel ── */
const ViewDocsPanel = React.memo(({ onClose }) => {
  const [fileList, setFileList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [pdfViewer, setPdfViewer] = useState(null); // { url, name }
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    axiosInstance.get("/api/file/fetch")
      .then(res => setFileList(res.data.files || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingList(false));
  }, []);

  const handleViewPdf = useCallback(async (doc) => {
    setLoadingPdf(true);
    try {
      const res = await axiosInstance.get(`/api/file/download/${doc._id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfViewer({ url, name: doc.filename || "Document" });
    } catch (err) {
      console.error("View error:", err);
      alert("Could not open document.");
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  const handleDownload = useCallback(async (doc) => {
    try {
      const res = await axiosInstance.get(`/api/file/download/${doc._id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = doc.filename || "file";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  }, []);

  const closePdf = useCallback(() => {
    if (pdfViewer?.url) window.URL.revokeObjectURL(pdfViewer.url);
    setPdfViewer(null);
  }, [pdfViewer]);

  return (
    <>
      {/* Slide-in panel overlay */}
      <div className="vd-overlay" onClick={onClose} />
      <div className="vd-panel">
        <div className="vd-header">
          <div>
            <h3 className="vd-title">Documents</h3>
            <p className="vd-sub">{fileList.length} file{fileList.length !== 1 ? "s" : ""} uploaded</p>
          </div>
          <button className="vd-close" onClick={onClose}><CloseIcon fontSize="small" /></button>
        </div>

        <div className="vd-body">
          {loadingList ? (
            <div className="vd-loading">
              <div className="vd-spinner" />
              <span>Loading documents…</span>
            </div>
          ) : fileList.length === 0 ? (
            <div className="vd-empty">
              <span>📂</span>
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <ul className="vd-list">
              {fileList.map((doc) => (
                <li key={doc._id} className="vd-item">
                  <span className="vd-icon">{getFileIcon(doc.filename)}</span>
                  <div className="vd-info">
                    <span className="vd-name" title={doc.filename}>{doc.filename}</span>
                    <span className="vd-meta">
                      {parseFloat(doc.size / 1000).toFixed(1)} KB
                      {doc.complianceId ? ` · ${doc.complianceId}` : ""}
                    </span>
                  </div>
                  <div className="vd-actions">
                    {isPdf(doc.filename) && (
                      <button
                        className="vd-btn view"
                        title="View PDF"
                        onClick={() => handleViewPdf(doc)}
                        disabled={loadingPdf}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </button>
                    )}
                    <button
                      className="vd-btn download"
                      title="Download"
                      onClick={() => handleDownload(doc)}
                    >
                      <FileDownloadOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* PDF viewer on top of the panel */}
      {pdfViewer && (
        <div className="vd-pdf-overlay" onClick={closePdf}>
          <div className="vd-pdf-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-pdf-header">
              <span className="vd-pdf-name">{pdfViewer.name}</span>
              <button className="vd-close" onClick={closePdf}><CloseIcon fontSize="small" /></button>
            </div>
            <iframe src={pdfViewer.url} title={pdfViewer.name} className="vd-pdf-frame" frameBorder="0" />
          </div>
        </div>
      )}
    </>
  );
});

const Layout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const [search, setSearch]             = useState("");
  const [showDrop, setShowDrop]         = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showViewDocs, setShowViewDocs] = useState(false);
  const userMenuRef = useRef(null);

  const user = useSelector(state => state.auth.user) || {};
  const nameParts = user.acc_fname ? user.acc_fname.split(" ") : ["", ""];
  const userName = user.acc_uname || "User";
  const role = user.acc_typ?.typname || "Administrator";
  const initials = `${nameParts.join(" ")?.[0] || "U"}`.toUpperCase();

  const isActive = (path) =>
    location.pathname.startsWith(path) ||
    (path === "/setting" && location.pathname.startsWith("/masters"));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigate("/setting");
  };

  const quickLinks = search.trim()
    ? navItems.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/compliance?q=${encodeURIComponent(search.trim())}`);
      setSearch(""); setShowDrop(false);
    }
    if (e.key === "Escape") { setSearch(""); setShowDrop(false); }
  };

  return (
    <div className="dashboard">
      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <h2 className="logo">Document Management System</h2>

        <ul>
          {navItems.map(item => (
            <li
              key={item.path}
              className={isActive(item.path) ? "active" : ""}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="footer-box">
            <h4>Manage Documents</h4>
            <p>Download your history or view our integration guides</p>
            <button onClick={() => navigate("/compliance")}>Export Data</button>
            <button onClick={() => setShowViewDocs(true)}>View Docs</button>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-search-wrap">
            <SearchIcon className="search-icon" />
            <input
              placeholder="Search compliance, documents..."
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            />
            {showDrop && quickLinks.length > 0 && (
              <div className="search-dropdown">
                {quickLinks.map(link => (
                  <div
                    key={link.path}
                    className="search-dropdown-item"
                    onMouseDown={() => navigate(link.path)}
                  >
                    {link.icon} {link.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="topbar-right">
            <div className="topbar-bell">
              <NotificationsNoneIcon />
            </div>

            <div className="topbar-user-wrap" ref={userMenuRef}>
              <div className="topbar-user" onClick={() => setShowUserMenu(prev => !prev)}>
                <div className="topbar-avatar">{initials}</div>
                <div className="topbar-user-info">
                  <span className="topbar-user-name">{userName}</span>
                  <span className="topbar-user-role">{role}</span>
                </div>
              </div>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-item" onClick={handleProfile}>
                    <PersonOutlineIcon fontSize="small" />
                    <span>Profile</span>
                  </div>
                  <div className="user-dropdown-divider" />
                  <div className="user-dropdown-item logout" onClick={handleLogout}>
                    <LogoutIcon fontSize="small" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAGE BODY */}
        <div className="page-body">
          <Outlet />
        </div>
      </div>

      {/* ── VIEW DOCS PANEL ── */}
      {showViewDocs && <ViewDocsPanel onClose={() => setShowViewDocs(false)} />}
    </div>
  );
};

export default Layout;
