import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import "../styles/Dashboard.css";

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="dashboard">

            {/* SIDEBAR */}
            <div className="sidebar">
                <h2 className="logo">Compliance System</h2>

                <ul>
                    <li
                        className={location.pathname === "/dashboard" ? "active" : ""}
                        onClick={() => navigate("/dashboard")}
                    >
                       <DashboardOutlinedIcon /> Dashboard
                    </li>

                    <li
                        className={location.pathname === "/compliance" ? "active" : ""}
                        onClick={() => navigate("/compliance")}
                    >
                        <FileOpenOutlinedIcon /> Compliance
                    </li>

                    <li>
                        <TextSnippetOutlinedIcon /> Documents
                    </li>
                    <li>
                        <PeopleAltOutlinedIcon /> Users
                    </li>
                    <li>
                        <SettingsOutlinedIcon /> Settings
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <div className="footer-box">
                        <h4>Manage Compliance Data</h4>
                        <p>Download reports or view important docs</p>

                        <button>Export Data</button>
                        <button>View Docs</button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main">

                {/* TOPBAR */}
                <div className="topbar">
                    <input placeholder="Search compliance, documents..." />
                    <div className="user">{user?.name || "User"}</div>
                </div>

                {/* PAGE CONTENT WILL LOAD HERE */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;