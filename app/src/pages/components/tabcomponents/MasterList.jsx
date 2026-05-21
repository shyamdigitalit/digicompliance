import React from "react";
import '../../styles/Setting.css'
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axiosInstance";
import Loader from "../../../components/loader";
import { masterListTabs } from "./masterListTabs";
import moment from "moment";

// const getMasterKey = (type) => `master_${type}`;

const MasterList = React.memo(function MasterList() {
  // console.log(masterListTabs);
  const { type } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false)

  // console.log(type);
  const masterTab = React.useMemo(() => masterListTabs.find(m => m.key === type), [type])
  // const masterTab = masterListTabs.find(m => m.key === type)
  // console.log(masterTab);

  const fetchMasterData = React.useCallback(async () => {
    let apiType = "";
    switch (type) {
      case "function": apiType = "func"; break;
      case "accounttype": apiType = "acctyp"; break;
      case "plant": apiType = "plnt"; break;
      case "department": apiType = "dept"; break;
      case "company": apiType = "cmpny"; break;
      case "designation": apiType = "desig"; break;
      case "compliancetype": apiType = "comptyp"; break;
      case "compliancecategory": apiType = "compcateg"; break;
      case "compliancefrequency": apiType = "compfreq"; break;
      case "criticality": apiType = "criticlty"; break;
      case "penaltytype": apiType = "penlty"; break;
    }
    setLoading(true)

    try {
      const response = await axiosInstance.get(`/api/${apiType==="acctyp" ? "acctyp/fetchuppr" : `${apiType}/fetch`}`);
      setData(response.data?.data || []);
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [type, setData, setLoading]);

  React.useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const handleDelete = React.useCallback(async (idx) => {
    let apiType = "";
    switch (type) {
      case "function": apiType = "func"; break;
      case "accounttype": apiType = "acctyp"; break;
      case "site": apiType = "plnt"; break;
      case "department": apiType = "dept"; break;
      case "company": apiType = "cmpny"; break;
      case "designation": apiType = "desig"; break;
      case "compliancetype": apiType = "comptyp"; break;
      case "compliancecategory": apiType = "compcateg"; break;
      case "compliancefrequency": apiType = "compfreq"; break;
      case "criticality": apiType = "criticlty"; break;
      case "penaltytype": apiType = "penlty"; break;
    }
    setLoading(true)

    try {
      if (window.confirm("Delete this entry?")) {
        const response = await axiosInstance.delete(`/api/${apiType}/delete?id=${data[idx]._id}`);
        if (response.status === 200) {
          setSaved(true);
          setTimeout(() => {
            setData(prev => prev.filter((_, i) => i !== idx));
            setSaved(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [type, setData, setSaved, data]);

  const handleToggleStatus = (idx) => {
    setData(prev => prev.map((item, i) => i === idx ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item));
  };

  const label = masterTab.tabName.charAt(0).toUpperCase() + masterTab.tabName.slice(1);

  return (
    <div className="master-card">
      <div className="master-header">
        <div>
          <h3>{label}</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>{data.length} record{data.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Removed! Reloading…</span>}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="light-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="dark-btn" onClick={() => navigate(`/masters/${type}/add`)}>+ Add</button>
        </div>
      </div>

      { loading ? <Loader /> : (
        masterTab.key === "function" ? (
          <div className="table-scroll-wrap">
            <table>
              <thead>
                <tr>
                  <th className="text-nowrap">Name</th>
                  <th className="text-nowrap">Path</th>
                  <th className="text-nowrap">Query</th>
                  <th className="text-nowrap">Heirarchy</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Created At</th>
                  <th className="text-nowrap">Updated At</th>
                  <th className="text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records yet. Click "+ Add" to create one.</td></tr>
                ) : data?.map((item, i) => (
                  <tr key={i}>
                    <td className="text-nowrap">{item.name}</td>
                    <td className="text-nowrap">{item.path}</td>
                    <td className="text-nowrap">{item.query}</td>
                    <td className="text-nowrap">{item.heirarchy}</td>
                    <td className="text-nowrap">
                      <span
                        className={`tag ${item.status === "Active" ? "green" : "red-light"}`}
                        onClick={() => handleToggleStatus(i)}
                        style={{ cursor: "pointer" }}
                        title="Click to toggle"
                      >{item.status}</span>
                    </td>
                    <td className="text-nowrap">{moment(item.createdAt).format("DD-MM-YYYY")}</td>
                    <td className="text-nowrap">{moment(item.updatedAt).format("DD-MM-YYYY")}</td>
                    <td className="text-nowrap">
                      <button onClick={() => handleDelete(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : masterTab.key === "accounttype" ? (
          <div className="table-scroll-wrap">
            <table>
              <thead>
                <tr>
                  <th className="text-nowrap">Type</th>
                  <th className="text-nowrap">Heirarchy</th>
                  <th className="text-nowrap">Same Level</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Created At</th>
                  <th className="text-nowrap">Updated At</th>
                  <th className="text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records yet. Click "+ Add" to create one.</td></tr>
                ) : data?.map((item, i) => (
                  <tr key={i}>
                    <td className="text-nowrap">{item.typname}</td>
                    <td className="text-nowrap">{item.heirarchy}</td>
                    <td className="text-nowrap">{String(item.stacklvl)}</td>
                    <td className="text-nowrap">
                      <span
                        className={`tag ${item.status === "Active" ? "green" : "red-light"}`}
                        onClick={() => handleToggleStatus(i)}
                        style={{ cursor: "pointer" }}
                        title="Click to toggle"
                      >{item.status}</span>
                    </td>
                    <td className="text-nowrap">{moment(item.createdAt).format("DD-MM-YYYY")}</td>
                    <td className="text-nowrap">{moment(item.updatedAt).format("DD-MM-YYYY")}</td>
                    <td className="text-nowrap">
                      <button onClick={() => handleDelete(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-scroll-wrap">
            <table>
              <thead>
                <tr>
                  <th className="text-nowrap">Name</th>
                  <th className="text-nowrap">Code</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Created At</th>
                  <th className="text-nowrap">Updated At</th>
                  <th className="text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No records yet. Click "+ Add" to create one.</td></tr>
                ) : data?.map((item, i) => (
                  <tr key={i}>
                    <td className="text-nowrap">{item.name}</td>
                    <td className="text-nowrap" style={{ fontFamily: "monospace", color: "#6b7280" }}>{item.code}</td>
                    <td className="text-nowrap">
                      <span
                        className={`tag ${item.status === "Active" ? "green" : "red-light"}`}
                        onClick={() => handleToggleStatus(i)}
                        style={{ cursor: "pointer" }}
                        title="Click to toggle"
                      >{item.status}</span>
                    </td>
                    <td className="text-nowrap">{moment(item.createdAt).format("DD-MM-YYYY")}</td>
                    <td className="text-nowrap">{moment(item.updatedAt).format("DD-MM-YYYY")}</td>
                    <td className="text-nowrap">
                      <button onClick={() => handleDelete(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "15px" }} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
})

export default MasterList;
