import React from "react";
import "../styles/Dashboard.css";

import FilePresentIcon from '@mui/icons-material/FilePresent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Dashboard = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const deadlines = [
    { title: "Fire Safety Inspection", plant: "Mumbai Plant A", priority: "Critical", days: "5 days" },
    { title: "ISO Audit Review", plant: "Delhi Plant B", priority: "High", days: "8 days" },
    { title: "Labour Law Compliance", plant: "Bangalore Plant C", priority: "Medium", days: "13 days" },
    { title: "Environmental Assessment", plant: "Mumbai Plant A", priority: "High", days: "15 days" }
  ];

  const activities = [
    { text: "Completed Safety Inspection - Mumbai Plant A", user: "John Doe", time: "2 hours ago" },
    { text: "Approved Quality Audit - Delhi Plant", user: "Michael Smith", time: "4 hours ago" },
    { text: "Updated Labour Law Compliance", user: "Sarah Lee", time: "6 hours ago" },
    { text: "Rejected Product Testing Report", user: "Robert Brown", time: "1 day ago" }
  ];

  const getTagClass = (priority) => {
    if (priority === "Critical") return "tag red";
    if (priority === "High") return "tag orange";
    return "tag yellow";
  };

  return (
    <>

      {/* Stats */}
      <div className="stats">
        <div className="card">
          <span>
            <p><strong>Total Compliance</strong></p>
            <FilePresentIcon style={{ color: "#1e73be" }} />
          </span>
          <h2>248</h2>
        </div>

        <div className="card">
          <span>
            <p><strong>Pending</strong></p>
            <AccessTimeIcon style={{ color: "#f97316" }} />
          </span>
          <h2>32</h2>
        </div>

        <div className="card">
          <span>
            <p><strong>Critical</strong></p>
            <ErrorOutlineIcon style={{ color: "#ef4444" }} />
          </span>
          <h2>8</h2>
        </div>

        <div className="card">
          <span>
            <p><strong>Completed</strong></p>
            <CheckCircleOutlineIcon style={{ color: "#22c55e" }} />
          </span>
          <h2>208</h2>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <div className="left">
          <h3>Upcoming Deadlines</h3>
          <ul>
            {deadlines.map((item, i) => (
              <li key={i}>
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
            {activities.map((item, i) => (
              <li key={i}>
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
    </>
  );
};

export default Dashboard;

