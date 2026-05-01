import React from "react";
import "../styles/Dashboard.css";
import FilePresentIcon        from '@mui/icons-material/FilePresent';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon       from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import axiosInstance from "../../config/axiosInstance";

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const defaultCompliance = [
  { id:"CMP-001", plant:"Mumbai Plant A",    dept:"Operations",  type:"Safety Inspection",       category:"Health & Safety",    freq:"Monthly",   criticality:"High",     status:"Completed",   dueDate: futureDate(-5)  },
  { id:"CMP-002", plant:"Delhi Plant B",     dept:"Quality",     type:"ISO Audit Review",        category:"Quality Management", freq:"Quarterly", criticality:"Critical", status:"Pending",     dueDate: futureDate(3)   },
  { id:"CMP-003", plant:"Bangalore Plant C", dept:"HR",          type:"Labour Law Compliance",   category:"Statutory",          freq:"Annual",    criticality:"Medium",   status:"In Progress", dueDate: futureDate(8)   },
  { id:"CMP-004", plant:"Mumbai Plant A",    dept:"Environment", type:"Environmental Assessment", category:"Environmental",      freq:"Monthly",   criticality:"High",     status:"Pending",     dueDate: futureDate(5)   },
  { id:"CMP-005", plant:"Delhi Plant B",     dept:"Operations",  type:"Fire Safety",             category:"Health & Safety",    freq:"Weekly",    criticality:"High",     status:"Completed",   dueDate: futureDate(-2)  },
  { id:"CMP-006", plant:"Bangalore Plant C", dept:"Quality",     type:"Product Testing",         category:"Quality Management", freq:"Daily",     criticality:"Medium",   status:"In Progress", dueDate: futureDate(12)  },
  { id:"CMP-007", plant:"Mumbai Plant A",    dept:"HR",          type:"Employee Training",       category:"Statutory",          freq:"Quarterly", criticality:"Low",      status:"Pending",     dueDate: futureDate(15)  },
  { id:"CMP-008", plant:"Delhi Plant B",     dept:"Environment", type:"Waste Management",        category:"Environmental",      freq:"Monthly",   criticality:"High",     status:"Completed",   dueDate: futureDate(-1)  },
];

const defaultActivities = [
  { text:"Completed Safety Inspection - Mumbai Plant A",  user:"John Smith",    time:"2 hours ago" },
  { text:"Approved Quality Audit - Delhi plant",          user:"Michael Chen",  time:"4 hours ago" },
  { text:"Updated Labour Law Compliance",                 user:"Sarah Johnson", time:"5 hours ago" },
  { text:"Created New Compliance Record",                 user:"Emily Davis",   time:"1 day ago"   },
  { text:"Rejected Product Testing Report",               user:"Robert Wilson", time:"1 day ago"   },
  { text:"Scheduled Safety Training Session - Bengaluru", user:"Lisa Patel",    time:"2 days ago"  },
];

const Dashboard = () => {
  // No localStorage — use default data directly
  const complianceData = defaultCompliance;
  const activities     = defaultActivities;
  const [allDashData, setAllDashData] = React.useState([]);

  const fetchAllDashData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/dash/fetch');
      console.log(response.data.data);
      setAllDashData(response.data.data);
    } catch (error) {
      console.error(error)
    }
  }, []);
  React.useEffect(() => {
    fetchAllDashData();
  }, [fetchAllDashData]);

  const stats = React.useMemo(() => ({
    total:     complianceData.length,
    pending:   complianceData.filter(c => c.status === "Pending").length,
    critical:  complianceData.filter(c => c.criticality === "Critical").length,
    completed: complianceData.filter(c => c.status === "Completed").length,
  }), [complianceData]);

  const upcomingDeadlines = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return complianceData
      .filter(c => c.status !== "Completed" && c.dueDate)
      .map(c => {
        const due = new Date(c.dueDate);
        due.setHours(0, 0, 0, 0);
        return { ...c, daysLeft: Math.round((due - today) / 86400000) };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [complianceData]);

  const categoryBreakdown = React.useMemo(() => {
    const cats = {};
    complianceData.forEach(c => {
      if (!cats[c.category]) cats[c.category] = { total: 0, completed: 0 };
      cats[c.category].total++;
      if (c.status === "Completed") cats[c.category].completed++;
    });
    return Object.entries(cats).map(([name, v]) => ({
      name, total: v.total, completed: v.completed,
      pct: Math.round((v.completed / v.total) * 100),
    }));
  }, [complianceData]);

  const statusDist = React.useMemo(() => {
    const total      = complianceData.length || 1;
    const completed  = complianceData.filter(c => c.status === "Completed").length;
    const inProgress = complianceData.filter(c => c.status === "In Progress").length;
    const pending    = complianceData.filter(c => c.status === "Pending" || c.status === "Overdue").length;
    return [
      { label:"Good", count:completed,  pct:Math.round(completed  / total * 100), cls:"good" },
      { label:"Fair", count:inProgress, pct:Math.round(inProgress / total * 100), cls:"fair" },
      { label:"Poor", count:pending,    pct:Math.round(pending    / total * 100), cls:"poor" },
    ];
  }, [complianceData]);

  const tagClass = p =>
    p === "Critical" ? "tag red" : p === "High" ? "tag orange" : p === "Medium" ? "tag yellow" : "tag blue";

  const daysLabel = d => d < 0 ? `${Math.abs(d)} days overdue` : d === 0 ? "Due today" : `${d} days`;
  const daysClass = d => `deadline-days${d < 0 ? " overdue-text" : d <= 5 ? " urgent-text" : ""}`;

  const formatDate = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  // const completionPct = stats.total ? Math.round(stats.completed / stats.total * 100) : 0;

  const completionPct = React.useMemo(() => {
    const total = parseInt(allDashData?.total) || 0;
    const compltd = parseInt(allDashData?.byStatus?.Active) || 0;
    return total ? Math.round(compltd / total * 100) : 0;
  }, [allDashData]);

  return (
    <>
      <div className="dash-header">
        <h2>Dashboard</h2>
        <p>Overview of compliance status and activities</p>
      </div>

      <div className="stats">
        <div className="card">
          <div className="card-top">
            <span className="card-label">Total Compliance</span>
            <div className="card-icon blue"><FilePresentIcon style={{ color:"#2563eb" }} /></div>
          </div>
          <h2>{allDashData?.total}</h2>
          <div className="card-sub positive">↑ +12 this month</div>
        </div>
        <div className="card">
          <div className="card-top">
            <span className="card-label">Pending</span>
            <div className="card-icon orange"><AccessTimeIcon style={{ color:"#f97316" }} /></div>
          </div>
          <h2 style={{ color:"#f97316" }}>{allDashData?.byStatus?.Pending || 0}</h2>
          <div className="card-sub warning">Requires attention</div>
        </div>
        <div className="card">
          <div className="card-top">
            <span className="card-label">Critical</span>
            <div className="card-icon red"><ErrorOutlineIcon style={{ color:"#ef4444" }} /></div>
          </div>
          <h2 style={{ color:"#ef4444" }}>{stats.critical}</h2>
          <div className="card-sub danger">High priority</div>
        </div>
        <div className="card">
          <div className="card-top">
            <span className="card-label">Completed</span>
            <div className="card-icon green"><CheckCircleOutlineIcon style={{ color:"#22c55e" }} /></div>
          </div>
          <h2 style={{ color:"#22c55e" }}>{allDashData?.byStatus?.Active || 0}</h2>
          <div className="card-sub success">{completionPct}% completion rate</div>
        </div>
      </div>

      <div className="content">
        <div className="left">
          <div className="panel-header">
            <h3>Upcoming Deadlines</h3>
            <CalendarTodayIcon />
          </div>
          {upcomingDeadlines.length === 0
            ? <p style={{ color:"#9ca3af", fontSize:"13px" }}>No upcoming deadlines</p>
            : upcomingDeadlines.map((item, i) => (
              <div className="deadline-item" key={i}>
                <div className="deadline-left">
                  <div className="deadline-title">{item.type}</div>
                  <div className="deadline-plant">{item.plant}</div>
                </div>
                <span className={tagClass(item.criticality)}>{item.criticality}</span>
                <div className="deadline-right">
                  <div className={daysClass(item.daysLeft)}>{daysLabel(item.daysLeft)}</div>
                  <div className="deadline-date">{formatDate(item.dueDate)}</div>
                </div>
              </div>
            ))
          }
        </div>

        <div className="right">
          <div className="panel-header"><h3>Recent Activity</h3></div>
          {activities.slice(0, 6).map((item, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-dot" />
              <div className="activity-body">
                <div className="activity-text">{item.text}</div>
                <div className="activity-meta">By: {item.user}</div>
              </div>
              <div className="activity-time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom">
        <div className="progress">
          <h4>Compliance by Category</h4>
          {categoryBreakdown.map((cat, i) => (
            <React.Fragment key={i}>
              <div className="category">
                <span>{cat.name}</span>
                <span>{cat.completed}/{cat.total} ({cat.pct}%)</span>
              </div>
              <div className="bar">
                <div className="fill" style={{ width:`${cat.pct}%` }} />
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="progress">
          <h4>Quality Distribution</h4>
          {statusDist.map((s, i) => (
            <React.Fragment key={i}>
              <div className="category">
                <span>{s.label}</span>
                <span>{s.pct}%</span>
              </div>
              <div className="bar">
                <div className={`fill ${s.cls}`} style={{ width:`${s.pct}%` }} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;