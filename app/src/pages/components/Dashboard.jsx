import React from "react";
import "../styles/Dashboard.css";
import FilePresentIcon        from '@mui/icons-material/FilePresent';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon       from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import axiosInstance from "../../config/axiosInstance";
import Loader from '../../components/loader';
import { getActivityLog, formatActivityTime } from "../utils/activityLog";
import moment from "moment";


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
  // const complianceData = defaultCompliance;
  const [activities, setActivities] = React.useState([]);
  const [allDashData, setAllDashData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [statusDist, setStatusDist] = React.useState([]);
  const [compliance, setCompliance] = React.useState([])

  const fetchCompliance = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/comp/fetch')
      const complnc = response.data?.data?.sort((a, b) => {
        const criticalityOrder = {
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
        };
        // Get criticality values
        const aCriticality = criticalityOrder[a?.criticality?.code] || 0;
        const bCriticality = criticalityOrder[b?.criticality?.code] || 0;
        // 1. Sort by criticality (Higher → Lower)
        if (bCriticality !== aCriticality) {
            return bCriticality - aCriticality;
        }

        // 2. Sort by due date (Nearer today first)
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
      .map((elm) => {
        const today = new Date()
        today.setHours(0,0,0,0)
        const dueDate = new Date(elm.dueDate)
        dueDate.setHours(0,0,0,0)
        const dateDiff = Math.ceil((dueDate - today)/(1000*60*60*24))
        
        return {
          ...elm,
          dueDateFormatted: moment(elm.dueDate).format("DD-MM-YYYY"),
          dateDifference: dateDiff
        }
      })
      setCompliance(complnc || [])
    } catch (error) {
      console.error(error)
    }
  }, [])
  React.useEffect(() => {
    fetchCompliance()
  }, [fetchCompliance])

  // Load activity log from localStorage on mount and on window focus
  React.useEffect(() => {
    const loadActivities = () => setActivities(getActivityLog());
    loadActivities();
    window.addEventListener("focus", loadActivities);
    // Also poll every 5s so activities appear quickly after actions
    const interval = setInterval(loadActivities, 5000);
    return () => {
      window.removeEventListener("focus", loadActivities);
      clearInterval(interval);
    };
  }, []);

  const statusDistribution = React.useCallback((compianceStat) => {
    const total      = compianceStat?.total || 1;
    const completed  = compianceStat?.byStatus?.find(s => s.name === "Active")?.count || 0;
    const inProgress = compianceStat?.byStatus?.find(s => s.name === "Open" || s.name === "Pending")?.count || 0;
    const inactive    = compianceStat?.byStatus?.find(s => s.name === "Inactive" || s.name === "Closed")?.count || 0;
    return [
      { label:"Good", count:completed, pct:Math.round(completed / total * 100), cls:"good" },
      { label:"Fair", count:inProgress, pct:Math.round(inProgress / total * 100), cls:"fair" },
      { label:"Poor", count:inactive, pct:Math.round(inactive / total * 100), cls:"poor" },
    ];
  }, []);

  const fetchAllDashData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/dash/fetch');
      console.log(response.data.data);
      setAllDashData(response.data.data);
      const statusCount = response.data.data?.byStatus?.filter(s => ["Open","Pending"].includes(s.name)).reduce((sum, item) => sum+item.count, 0)
      console.log(statusCount);
      setStatusDist(statusDistribution(response.data.data));
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false);
    }
  }, [statusDistribution]);
  React.useEffect(() => {
    fetchAllDashData();
  }, [fetchAllDashData]);
  
  const tagClass = p =>
    p === "Critical" ? "tag red" : p === "High" ? "tag orange" : p === "Medium" ? "tag yellow" : "tag blue";

  const daysLabel = d => d < 0 ? `${Math.abs(d)} days overdue` : d === 0 ? "Due today" : `${d} days`;
  const daysClass = d => `deadline-days${d < 0 ? " overdue-text" : d <= 5 ? " urgent-text" : ""}`;

  const formatDate = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  return (
    <>
      {loading ? <Loader /> : (
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
                <span className="card-label">Open & Pending</span>
                <div className="card-icon orange"><AccessTimeIcon style={{ color:"#f97316" }} /></div>
              </div>
              <h2 style={{ color:"#f97316" }}>{allDashData?.byStatus?.filter(s => ["Open","Pending"].includes(s.name)).reduce((sum, item) => sum+item.count, 0) || 0}</h2>
              <div className="card-sub warning">Requires attention</div>
            </div>
            <div className="card">
              <div className="card-top">
                <span className="card-label">Critical</span>
                <div className="card-icon red"><ErrorOutlineIcon style={{ color:"#ef4444" }} /></div>
              </div>
              <h2 style={{ color:"#ef4444" }}>{allDashData?.byCriticality?.find(c => c.name === "High")?.count || 0}</h2>
              <div className="card-sub danger">High priority</div>
            </div>
            <div className="card">
              <div className="card-top">
                <span className="card-label">Completed</span>
                <div className="card-icon green"><CheckCircleOutlineIcon style={{ color:"#22c55e" }} /></div>
              </div>
              <h2 style={{ color:"#22c55e" }}>{allDashData?.byStatus?.find(s => s.name === "Active")?.count || 0}</h2>
              <div className="card-sub success">{parseFloat((allDashData?.byStatus?.filter(s => s.name === "Active")?.count || 0)/allDashData?.total * 100).toFixed(2)}% completion rate</div>
            </div>
          </div>

          <div className="content">
            <div className="left">
              <div className="panel-header">
                <h3>Upcoming Deadlines</h3>
                <CalendarTodayIcon />
              </div>
              {compliance.length === 0
                ? <p style={{ color:"#9ca3af", fontSize:"13px" }}>No upcoming deadlines</p>
                : compliance.map((item, i) => (
                  <div className="deadline-item" key={i}>
                    <div className="deadline-left">
                      <div className="deadline-title">{item?.complianceCategorization?.name}</div>
                      <div className="deadline-plant">{item?.plant?.name} Plant - {item?.plant?.code}</div>
                    </div>
                    <span className={tagClass(item?.criticality?.name)}>{item?.criticality?.name}</span>
                    <div className="deadline-right">
                      <div className={daysClass(parseInt(item?.dateDifference))}>{daysLabel(item?.dateDifference)}</div>
                      <div className="deadline-date">{formatDate(item.dueDate)}</div>
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="right">
              <div className="panel-header"><h3>Recent Activity</h3></div>
              {(activities.length > 0 ? activities : defaultActivities).slice(0, 6).map((item, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-dot" />
                  <div className="activity-body">
                    <div className="activity-text">{item.text}</div>
                    <div className="activity-meta">By: {item.user}</div>
                  </div>
                  <div className="activity-time">
                    {item.time && item.time.includes("T") ? formatActivityTime(item.time) : item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bottom">
            <div className="progress">
              <h4>Compliance by Types</h4>
              {allDashData?.byType?.map((typ, i) => (
                <React.Fragment key={i}>
                  <div className="barchart">
                    <span>{typ.name}</span>
                    <span>{typ.count}/{allDashData?.total} ({parseFloat(typ.count / allDashData?.total * 100).toFixed(2)}%)</span>
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width:`${parseFloat(typ.count / allDashData?.total * 100).toFixed(2)}%` }} />
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="progress">
              <h4>Compliance by Category</h4>
              {allDashData?.byCategory?.map((cat, i) => (
                <React.Fragment key={i}>
                  <div className="barchart">
                    <span>{cat.name}</span>
                    <span>{cat.count}/{allDashData?.total} ({parseFloat(cat.count / allDashData?.total * 100).toFixed(2)}%)</span>
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width:`${parseFloat(cat.count / allDashData?.total * 100).toFixed(2)}%` }} />
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="progress">
              <h4>Compliance by Frequency</h4>
              {allDashData?.byFrequency?.map((frq, i) => (
                <React.Fragment key={i}>
                  <div className="barchart">
                    <span>{frq.name}</span>
                    <span>{frq.count}/{allDashData?.total} ({parseFloat(frq.count / allDashData?.total * 100).toFixed(2)}%)</span>
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width:`${parseFloat(frq.count / allDashData?.total * 100).toFixed(2)}%` }} />
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="progress">
              <h4>Quality Distribution</h4>
              {statusDist.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="barchart">
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
      )}
    </>
  );
};

export default Dashboard;