import React, { useState, useRef, useEffect } from "react";
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
import logo from "../../assets/logo.png";
import "../styles/Dashboard.css";
import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../redux/authSlice"; // ← uncomment if you have a logout action

const navItems = [
  { path: "/dashboard",  label: "Dashboard",  icon: <DashboardOutlinedIcon /> },
  { path: "/compliance", label: "Compliance", icon: <FileOpenOutlinedIcon /> },
  { path: "/document",   label: "Documents",  icon: <TextSnippetOutlinedIcon /> },
  { path: "/user",       label: "Users",      icon: <PeopleAltOutlinedIcon /> },
  { path: "/setting",    label: "Settings",   icon: <SettingsOutlinedIcon /> },
];

const Layout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const [search, setSearch]           = useState("");
  const [showDrop, setShowDrop]       = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const user = useSelector(state => state.auth.user) || {};
  const nameParts = user.acc_fname ? user.acc_fname.split(" ") : ["", ""];
  const userName = user.acc_uname || "User";
  const role = user.acc_typ?.typname || "Administrator";
  const initials = `${nameParts.join(" ")?.[0] || "U"}`.toUpperCase();

  const isActive = (path) =>
    location.pathname.startsWith(path) ||
    (path === "/setting" && location.pathname.startsWith("/masters"));

  // Close user menu when clicking outside
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
    // dispatch(logout()); // ← uncomment if using Redux logout action
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
        <h2 className="logo">Compliance System</h2>
        {/* <img className="logo" src={logo} alt="Logo" /> */}

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
            <h4>Manage Compliance Data</h4>
            <p>Download your history or view our integration guides</p>
            <button onClick={() => navigate("/compliance")}>Export Data</button>
            <button onClick={() => navigate("/document")}>View Docs</button>
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

            {/* ── USER MENU ── */}
            <div className="topbar-user-wrap" ref={userMenuRef}>
              <div
                className="topbar-user"
                onClick={() => setShowUserMenu(prev => !prev)}
              >
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
    </div>
  );
};

export default Layout;