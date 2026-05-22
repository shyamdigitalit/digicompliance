import React from "react";
import "../styles/Compliance.css";
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCompliance from "./AddCompliance";
import axiosInstance from "../../config/axiosInstance";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Loader from "../../components/loader";
import moment from 'moment';
import { logActivity } from "../utils/activityLog";

const COMPLIANCE_KEY = "compliance_data";
const ACTIVITY_KEY = "activity_log";

const PAGE_SIZE = 8;

const Compliance = React.memo(function Compliance() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const [masterData, setMasterData] = React.useState({
    plants: [],
    departments: [],
    complianceTypes: [],
    complianceCategories: [],
    complianceFrequencies: [],
    criticalities: [],
    penaltyTypes: []
  });

  const [data, setData] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // EXPORT STATES
  const [showExportSelection, setShowExportSelection] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState([]);

  const user = useSelector(state => state.auth.user);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/comp/fetch");
      setData(response.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchMasterData = React.useCallback(async () => {
    try {
      const [
        plantsRes,
        deptsRes,
        typesRes,
        categoriesRes,
        freqsRes,
        critsRes,
        penltsRes
      ] = await Promise.allSettled([
        axiosInstance.get("/api/plnt/fetch"),
        axiosInstance.get("/api/dept/fetch"),
        axiosInstance.get("/api/comptyp/fetch"),
        axiosInstance.get("/api/compcateg/fetch"),
        axiosInstance.get("/api/compfreq/fetch"),
        axiosInstance.get("/api/criticlty/fetch"),
        axiosInstance.get("/api/penlty/fetch")
      ]);

      setMasterData({
        plants: plantsRes.value?.data?.data || [],
        departments: deptsRes.value?.data?.data || [],
        complianceTypes: typesRes.value?.data?.data || [],
        complianceCategories: categoriesRes.value?.data?.data || [],
        complianceFrequencies: freqsRes.value?.data?.data || [],
        criticalities: critsRes.value?.data?.data || [],
        penaltyTypes: penltsRes.value?.data?.data || []
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  React.useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const [search, setSearch] = React.useState("");
  const [filterPlant, setFilterPlant] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterApprovalStatus, setFilterApprovalStatus] = React.useState("");
  const [filterCompTyp, setFilterCompTyp] = React.useState("");
  const [filterCompCat, setFilterCompCat] = React.useState("");
  const [filterCompFreq, setFilterCompFreq] = React.useState("");
  const [filterCriticality, setFilterCriticality] = React.useState("");
  const [filterPenaltyType, setFilterPenaltyType] = React.useState("");
  const [page, setPage] = React.useState(1);

  const pendingParams = React.useRef(null);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (!params.toString()) return;

    pendingParams.current = {
      criticality: params.get("criticality") || "",
      status: params.get("status") || "",
      approvalStatus: params.get("approvalStatus") || "",
      complianceId: params.get("complianceId") || "",
      q: params.get("q") || "",
    };

    navigate("/compliance", { replace: true });
  }, [location.search]);

  React.useEffect(() => {
    if (data.length > 0 && pendingParams.current) {
      const p = pendingParams.current;

      pendingParams.current = null;

      if (p.criticality) setFilterCriticality(p.criticality);
      if (p.status) setFilterStatus(p.status);
      if (p.approvalStatus) setFilterApprovalStatus(p.approvalStatus);
      if (p.complianceId) setSearch(p.complianceId);
      else if (p.q) setSearch(p.q);

      setPage(1);
    }
  }, [data]);

  React.useEffect(() => {
    localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(data));
  }, [data]);

  const plants = React.useMemo(
    () => [...new Set(data?.map(d => d.plant?.name || ""))],
    [data]
  );

  const depts = React.useMemo(
    () => [...new Set(data?.map(d => d.department?.name || ""))],
    [data]
  );

  const complianceTypes = React.useMemo(
    () => [...new Set(data?.map(d => d.complianceType?.name || ""))],
    [data]
  );

  const complianceCategories = React.useMemo(
    () => [...new Set(data?.map(d => d.complianceCategorization?.name || ""))],
    [data]
  );

  const complianceFrequencies = React.useMemo(
    () => [...new Set(data?.map(d => d.complianceFrequency?.name || ""))],
    [data]
  );

  const criticalities = React.useMemo(
    () => [...new Set(data?.map(d => d.criticality?.name || ""))],
    [data]
  );

  const penaltyTypes = React.useMemo(
    () => [...new Set(data?.map(d => d.penaltyType?.name || ""))],
    [data]
  );

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();

    return data?.filter(item => {
      const matchSearch =
        !q ||
        (item.complianceId || "").toLowerCase().includes(q) ||
        (item.complianceType?.name || "").toLowerCase().includes(q) ||
        (item.complianceCategorization?.name || "").toLowerCase().includes(q) ||
        (item.plant?.name || "").toLowerCase().includes(q);

      const matchPlant =
        !filterPlant || item.plant?.name === filterPlant;

      const matchDept =
        !filterDept || item.department?.name === filterDept;

      const matchStatus =
        !filterStatus ||
        (item.status || "").toLowerCase().trim() ===
        filterStatus.toLowerCase().trim();

      const matchCompTyp =
        !filterCompTyp || item.complianceType?.name === filterCompTyp;

      const matchCompCat =
        !filterCompCat || item.complianceCategorization?.name === filterCompCat;

      const matchCompFreq =
        !filterCompFreq || item.complianceFrequency?.name === filterCompFreq;

      const matchCriticality =
        !filterCriticality || item.criticality?.name === filterCriticality;

      const matchPenaltyType =
        !filterPenaltyType || item.penaltyType?.name === filterPenaltyType;

      return (
        matchSearch &&
        matchPlant &&
        matchDept &&
        matchStatus &&
        matchCompTyp &&
        matchCompCat &&
        matchCompFreq &&
        matchCriticality &&
        matchPenaltyType
      );
    });
  }, [
    data,
    search,
    filterPlant,
    filterDept,
    filterStatus,
    filterCompTyp,
    filterCompCat,
    filterCompFreq,
    filterCriticality,
    filterPenaltyType
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paged = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // EXPORT HANDLERS

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filtered.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filtered.map(item => item._id));
    }
  };

  const handleExportConfirm = React.useCallback((exportRows) => {
    const exportData = exportRows?.map(({
      _id,
      complianceId,
      plant,
      department,
      complianceType,
      complianceCategorization,
      complianceFrequency,
      criticality,
      penaltyType,
      dueDate,
      createdby,
      updatedby,
      ...rest
    }) => ({
      complianceId,
      plant: plant?.name,
      department: department?.name,
      complianceType: complianceType?.name,
      complianceCategorization: complianceCategorization?.name,
      complianceFrequency: complianceFrequency?.name,
      criticality: criticality?.name,
      penaltyType: penaltyType?.name,
      dueDate,
      createdby: createdby?.acc_fname,
      updatedby: updatedby?.acc_fname,
      ...rest
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Compliance'
    );

    XLSX.writeFile(workbook, 'Compliance_Datasheet.xlsx');

    logActivity(
      "Compliance Exported",
      `${exportData.length} records`,
      user
    );
  }, [user]);

  const handleExport = React.useCallback(() => {
    if (!filtered.length) {
      alert("No data available to export.");
      return;
    }

    if (!showExportSelection) {
      setShowExportSelection(true);
      return;
    }

    const exportRows =
      selectedRows.length === filtered.length
        ? filtered
        : filtered.filter(item =>
            selectedRows.includes(item._id)
          );

    if (!exportRows.length) {
      alert("Please select at least one compliance.");
      return;
    }

    handleExportConfirm(exportRows);

    setShowExportSelection(false);
    setSelectedRows([]);
  }, [
    filtered,
    selectedRows,
    showExportSelection,
    handleExportConfirm
  ]);

  const getTag = (val) =>
    val?.toLowerCase().replace(" ", "-");

  const isExpired = (dueDate) =>
    dueDate && new Date(dueDate) < new Date();

  return (
    <div className="compliance-page">
      {showAddForm ? (
        <AddCompliance
          onCancel={() => setShowAddForm(false)}
          initialData={editing}
          masterData={masterData}
        />
      ) : (
        <>
          <div className="header">
            <div>
              <h2>Compliance Management</h2>
              <p>
                Manage and track statutory compliance across all plants
              </p>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="filter-box">
                <div
                  className="filter-row"
                  style={{
                    display: 'flex',
                    flexFlow: 'row wrap'
                  }}
                >
                  <input
                    placeholder="Search by ID, type, category, plant..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />

                  <select
                    value={filterPlant}
                    onChange={e => {
                      setFilterPlant(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Plants</option>

                    {plants?.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterDept}
                    onChange={e => {
                      setFilterDept(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Departments</option>

                    {depts?.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-row second">
                  <button
                    className="dark-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    + Add Compliance
                  </button>

                  <button
                    className="dark-btn"
                    onClick={handleExport}
                  >
                    {!showExportSelection
                      ? "Export"
                      : selectedRows.length === filtered.length
                        ? `Export All (${filtered.length})`
                        : `Export Selected (${selectedRows.length})`}
                  </button>
                </div>
              </div>

              <div className="table-box">
                <div className="table-box-scroll">
                  <table>
                    <thead>
                      <tr>
                        {showExportSelection && (
                          <th>
                            <input
                              type="checkbox"
                              checked={
                                filtered.length > 0 &&
                                selectedRows.length === filtered.length
                              }
                              onChange={handleSelectAll}
                            />
                          </th>
                        )}

                        <th>Compliance ID</th>
                        <th>Plant</th>
                        <th>Department</th>
                        <th>Due Date</th>
                        <th>Compliance Type</th>
                        <th>Category</th>
                        <th>Frequency</th>
                        <th>Criticality</th>
                        <th>Status</th>
                        <th>Approval Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td
                            colSpan={12}
                            style={{
                              textAlign: "center",
                              color: "#9ca3af",
                              padding: "30px"
                            }}
                          >
                            No records found
                          </td>
                        </tr>
                      ) : (
                        paged.map((item) => (
                          <tr
                            key={item._id}
                            className={
                              isExpired(item.dueDate)
                                ? "row-expired"
                                : ""
                            }
                          >
                            {showExportSelection && (
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(item._id)}
                                  onChange={() =>
                                    handleSelectRow(item._id)
                                  }
                                />
                              </td>
                            )}

                            <td className="link">
                              {item.complianceId}
                            </td>

                            <td>{item?.plant?.name}</td>

                            <td>{item?.department?.name}</td>

                            <td>
                              {moment(item?.dueDate).format("DD-MM-YYYY")}
                            </td>

                            <td>
                              {item?.complianceType?.name}
                            </td>

                            <td>
                              {item?.complianceCategorization?.name}
                            </td>

                            <td>
                              {item?.complianceFrequency?.name}
                            </td>

                            <td>
                              <span
                                className={`tag ${getTag(
                                  item?.criticality?.name
                                )}`}
                              >
                                {item?.criticality?.name}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`status ${getTag(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`approval-badge approval-${getTag(
                                  item.approvalStatus
                                )}`}
                              >
                                {item.approvalStatus || "Pending"}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px"
                                }}
                              >
                                <button
                                  onClick={() => setEditing(item)}
                                  className="action-icon-btn edit"
                                  title="Edit"
                                >
                                  <EditNoteOutlinedIcon />
                                </button>

                                <button
                                  className="action-icon-btn zip"
                                  title="ZIP Download"
                                >
                                  <FolderZipOutlinedIcon />
                                </button>

                                <button
                                  className="action-icon-btn approve"
                                  title="Approve"
                                >
                                  <DoneAllIcon />
                                </button>

                                <button
                                  className="action-icon-btn reject"
                                  title="Reject"
                                >
                                  <CancelOutlinedIcon />
                                </button>

                                <button
                                  className="action-icon-btn delete"
                                  title="Delete"
                                >
                                  <DeleteSweepOutlinedIcon />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer">
                  <span>
                    Showing{" "}
                    {filtered.length === 0
                      ? 0
                      : (page - 1) * PAGE_SIZE + 1}
                    –
                    {Math.min(
                      page * PAGE_SIZE,
                      filtered.length
                    )}{" "}
                    of {filtered.length} results
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center"
                    }}
                  >
                    <button
                      className="light-btn"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => (
                        <button
                          key={i}
                          className={
                            page === i + 1
                              ? "dark-btn"
                              : "light-btn"
                          }
                          onClick={() => setPage(i + 1)}
                          style={{
                            padding: "6px 10px",
                            minWidth: "32px"
                          }}
                        >
                          {i + 1}
                        </button>
                      )
                    )}

                    <button
                      className="light-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
});

export default Compliance;