import React, { useState } from "react";
import "./styles/Dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import FilePresentIcon from '@mui/icons-material/FilePresent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Dashboard = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const deadlines = [
    {
      title: "Fire Safety Inspection",
      plant: "Mumbai Plant A",
      priority: "Critical",
      days: "5 days"
    },
    {
      title: "ISO Audit Review",
      plant: "Delhi Plant B",
      priority: "High",
      days: "8 days"
    },
    {
      title: "Labour Law Compliance",
      plant: "Bangalore Plant C",
      priority: "Medium",
      days: "13 days"
    },
    {
      title: "Environmental Assessment",
      plant: "Mumbai Plant A",
      priority: "High",
      days: "15 days"
    }
  ];

  const activities = [
    {
      text: "Completed Safety Inspection - Mumbai Plant A",
      user: "John Doe",
      time: "2 hours ago"
    },
    {
      text: "Approved Quality Audit - Delhi Plant",
      user: "Michael Smith",
      time: "4 hours ago"
    },
    {
      text: "Updated Labour Law Compliance",
      user: "Sarah Lee",
      time: "6 hours ago"
    },
    {
      text: "Rejected Product Testing Report",
      user: "Robert Brown",
      time: "1 day ago"
    }
  ];

  const getTagClass = (priority) => {
    if (priority === "Critical") return "tag red";
    if (priority === "High") return "tag orange";
    return "tag yellow";
  };

  return (
    <div className="dashboard">

      <div className="sidebar">
        <h2 className="logo">Compliance System</h2>

        <ul>
          <li
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </li>

          <li
            className={location.pathname === "/compliance" ? "active" : ""}
            onClick={() => navigate("/compliance")}
          >
            Compliance
          </li>

          <li>Documents</li>
          <li>Users</li>
          <li>Settings</li>
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

      <div className="main">

        <div className="topbar">
          <input placeholder="Search compliance, documents..." />
          <div className="user">{user?.name || "User"}</div>
        </div>

        <div className="stats">
          <div className="card">
            <span>
              <p><strong>Total Compliance</strong></p>
              <FilePresentIcon style={{ color: "#1e73be", fontSize: "20px" }} />
            </span>
            <h2>248</h2>
            <span className="positive">+12% this month</span>
          </div>

          <div className="card">
            <span><p><strong>Pending</strong></p>
              <AccessTimeIcon style={{ color: "#f97316", fontSize: "20px" }} />
            </span>
            <h2 className="pending-number">32</h2>
            <span className="muted">Requires attention</span>
          </div>

          <div className="card">
            <span><p><strong>Critical</strong></p>
              <ErrorOutlineIcon style={{ color: "#ef4444", fontSize: "20px" }} />
            </span>
            <h2 className="critical-number">8</h2>
            <span className="muted">High priority</span>
          </div>

          <div className="card">
            <span><p><strong>Completed</strong></p>
              <CheckCircleOutlineIcon style={{ color: "#22c55e", fontSize: "20px" }} />
            </span>
            <h2 className="completed-number">208</h2>
            <span className="positive">83% completion</span>
          </div>
        </div>

        <div className="content">

          <div className="left">
            <h3>Upcoming Deadlines</h3>

            <ul>
              {deadlines.map((item, index) => (
                <li key={index}>
                  <div className="row">
                    <strong>{item.title}</strong>
                    <span className={getTagClass(item.priority)}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="sub">{item.plant}</div>
                  <div className="days">{item.days}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="right">
            <h3>Recent Activity</h3>

            <ul>
              {activities.map((item, index) => (
                <li key={index}>
                  {item.text}
                  <div className="sub">by {item.user}</div>
                  <span className="time">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bottom">

          <div className="progress">
            <h4>Compliance by Category</h4>

            <div className="category">
              <span>Health & Safety</span>
              <span>72/85 (85%)</span>
            </div>
            <div className="bar">
              <div className="fill" style={{ width: "85%" }}></div>
            </div>

            <div className="category">
              <span>Quality Management</span>
              <span>54/62 (87%)</span>
            </div>
            <div className="bar">
              <div className="fill" style={{ width: "87%" }}></div>
            </div>
          </div>

          <div className="progress">
            <h4>Quality Distribution</h4>

            <div className="category">
              <span>Good</span>
              <span>75%</span>
            </div>
            <div className="bar">
              <div className="fill good" style={{ width: "75%" }}></div>
            </div>

            <div className="category">
              <span>Fair</span>
              <span>20%</span>
            </div>
            <div className="bar">
              <div className="fill fair" style={{ width: "20%" }}></div>
            </div>

            <div className="category">
              <span>Poor</span>
              <span>5%</span>
            </div>
            <div className="bar">
              <div className="fill poor" style={{ width: "5%" }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;