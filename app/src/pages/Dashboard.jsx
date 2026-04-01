import React from 'react'
import ComplianceTable from './compliance_modules/ComplianceTable';
import AddCompliance from './compliance_modules/AddCompliance';
import axiosInstance from '../config/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasters } from '../redux/slices/masterSlice';
import { showSnackbar } from '../redux/slices/snackbar';
import * as XLSX from 'xlsx';
import AddIcon from '@mui/icons-material/Add';
import { FileSpreadsheet } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // console.log(user);
  const [selectedColumn, setSelectedColumn] = React.useState('');
  const [searchValue, setSearchValue] = React.useState('');

  const [showAdd, setShowAdd] = React.useState(false);
  const [tableData, setTableData] = React.useState([]);

  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const fetchMaster = React.useCallback(() => {
    dispatch(fetchMasters());
  }, [dispatch])
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchMaster();
    }
  }, [fetchMaster, isAuthenticated])

  const getdata = React.useCallback(async () => {
  try {
    const res = await axiosInstance.get('/api/comp/fetch');

    if (res.status === 200) {
      setTableData(res.data.data);
    } else {
      setTableData([]);
    }
  } catch (error) {
    console.error(error);
    dispatch(
      showSnackbar({
        message: 'Failed to fetch compliance data.',
        severity: 'error'
      })
    );
  }
}, [dispatch]);

const filteredData = React.useMemo(() => {
  return tableData.filter(row => {
    if (fromDate && toDate) {
      const rowDate = new Date(row.createdAt);
      const start = new Date(fromDate);
      const end = new Date(toDate);

      end.setHours(23, 59, 59, 999);

      if (rowDate < start || rowDate > end) {
        return false;
      }
    }

    if (selectedColumn && searchValue) {
      const cellValue = row[selectedColumn];
      if (!cellValue) return false;

      return cellValue
        .toString()
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    }

    return true;
  });
}, [tableData, fromDate, toDate, selectedColumn, searchValue]);


  React.useEffect(() => {
    if (isAuthenticated) {
      getdata();
    }
  }, [getdata, isAuthenticated]);

  const handleAdd = async (formData) => {
    try {
      const res = await axiosInstance.post('/api/comp/create', formData);

      if (res.status === 201) {
        dispatch(showSnackbar({ message: 'Compliance added successfully!', severity: 'success' }));

        // ✅ ALWAYS re-fetch after add
        await getdata();
        setShowAdd(false);
      } else {
        dispatch(showSnackbar({ message: 'Failed to add compliance.', severity: 'error' }));
      }
    } catch (error) {
      console.error(error);
      dispatch(showSnackbar({ message: 'Something went wrong.', severity: 'error' }));
    }
  };

  const handleStatusChange = (id, status) => {
    setTableData(prev =>
      prev.map(row =>
        row.id === id ? { ...row, status } : row
      )
    );
  };

  const handleExport = () => {
    let exportData
    if (!filteredData.length) {
      dispatch(showSnackbar({ message: 'No data available to export.', severity: 'warning' }));
      return;
    }
    else {
      dispatch(showSnackbar({ message: 'Exporting data...', severity: 'info' }));
      exportData = filteredData?.map(({
        _id,
        plant,
        department,
        complianceType,
        complianceCategorization,
        complianceFrequency,
        criticality,
        penaltyType,
        allDocs,
        approvalDetails,
        createdAt,
        updatedAt,
        __v,
        ...rest
      }) => rest);
      console.log(exportData);

      // ✅ Convert JSON → Worksheet (ALL columns automatically)
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      // ✅ Create Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Compliance');
      // ✅ Export file
      XLSX.writeFile(workbook, 'Compliance_Datasheet.xlsx');
    }
  };


  return (
    <div className="dash-body">

      <main className="content">
        {!showAdd ? (
          <>
            {/* HEADER */}
            <div className="dashboard-header">
              <div className="header-functions">
                {
                  (user?.acc_typ?.heirarchy===3 && user?.acc_plnt?._id && user?.acc_dept?._id) && (
                    <button
                      className="icon-btn add"
                      data-tooltip="Add Compliance"
                      onClick={() => setShowAdd(true)}
                    >
                      <AddIcon />
                    </button>
                  )
                }
              </div>

              <div className="header-actions">
                <select
                  className="filter-select"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="">Select Column</option>
                  <option value="complianceId">Compliance Id</option>
                  <option value="plantName">Plant</option>
                  <option value="departmentName">Department</option>
                  <option value="complianceTypeName">Compliance Type</option>
                  <option value="complianceCategoryName">Compliance Categorization</option>
                  <option value="complianceFrequencyName">Compliance Frequency</option>
                  <option value="criticalityName">Criticality</option>
                  <option value="penaltyName">Penalty</option>
                  <option value="complianceHeader">Compliance Header</option>
                </select>

                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  disabled={!selectedColumn}
                />


                <input
                  type="date"
                  className="filter-select"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <input
                  type="date"
                  className="filter-select"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                />

                <section>
                  {/* <button className="calendar-btn">📅</button> */}
                  <button
                    className="icon-btn export-zip"
                    onClick={handleExport}
                    data-tooltip="Download Report as Excel"
                  >
                    <FileSpreadsheet style={{width:'100%'}} />
                  </button>
                </section>

                {/* <button className="download-btn">⬇</button> */}
              </div>
            </div>

            {/* TABLE (BELOW HEADER) */}
            <div className="table-section">
              <ComplianceTable
                data={filteredData}
                onStatusChange={handleStatusChange}
                onRefresh={getdata}
              />
            </div>
          </>
        ) : (
          <AddCompliance
            onCancel={() => setShowAdd(false)}
            onSubmit={handleAdd}
          />
        )}
      </main>

    </div>
  );
}

export default Dashboard;
