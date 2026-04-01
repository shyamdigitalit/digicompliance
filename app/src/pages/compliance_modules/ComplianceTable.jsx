import "../../styles/compliance_modules/ComplianceTable.css";
import React from "react";
import ViewComplianceModal from "./ViewCompliance";
import RemoveRedEyeTwoToneIcon from '@mui/icons-material/RemoveRedEyeTwoTone';
import DoNotDisturbOnTwoToneIcon from '@mui/icons-material/DoNotDisturbOnTwoTone';
import PlaylistAddCheckTwoToneIcon from '@mui/icons-material/PlaylistAddCheckTwoTone';
import { FolderArchive } from 'lucide-react';
import axiosInstance from '../../config/axiosInstance';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import moment from 'moment';

export default function ComplianceTable({ data = [], onRefresh }) {

  const dispatch = useDispatch();

  const [openView, setOpenView] = React.useState(false);
  const [selectedCompliance, setSelectedCompliance] = React.useState(null);

  // View handler
  const handleView = (row) => {
    setSelectedCompliance(row);
    setOpenView(true);
  };

  // ZIP Download handler
  const handleZipDownload = async (value = [], label = "Compliance_Files") => {

    if (!value || value.length === 0) {
      dispatch(showSnackbar({
        message: 'No files available for download!',
        severity: 'warning'
      }));
      return;
    }

    try {

      const backendFiles = value.filter(f => f.filId);
      const localFiles = value.filter(f => f instanceof File);
      const urlFiles = value.filter(f => f.filUrl && !f.filId);

      // Backend ZIP download
      if (backendFiles.length > 0) {

        try {

          const fileIds = backendFiles.map(f => f.filId).join(',');

          const response = await axiosInstance.get(
            `/api/file/downloadall?files=${fileIds}`,
            { responseType: 'blob' }
          );

          const blob = new Blob([response.data], {
            type: 'application/zip'
          });

          saveAs(blob, `${label}.zip`);

          dispatch(showSnackbar({
            message: 'Files downloaded successfully!',
            severity: 'success'
          }));

          return;

        } catch (err) {

          dispatch(showSnackbar({
            message: 'Backend ZIP failed, trying fallback.',
            severity: 'warning'
          }));
        }
      }

      // Fallback ZIP creation
      const zip = new JSZip();

      for (const file of localFiles) {
        zip.file(file.name, file);
      }

      for (const file of urlFiles) {

        const response = await fetch(file.filUrl);
        const blob = await response.blob();

        zip.file(file.filName || "file", blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      saveAs(zipBlob, `${label}.zip`);

      dispatch(showSnackbar({
        message: 'ZIP exported successfully!',
        severity: 'success'
      }));

    }
    catch (err) {

      console.error(err);

      dispatch(showSnackbar({
        message: 'ZIP download failed.',
        severity: 'error'
      }));
    }
  };

  // Approve handler
  const handleApprove = async (row) => {

    try {

      if (!window.confirm("Approve this compliance?")) return;

      const res = await axiosInstance.patch(
        `/api/comp/approve?id=${row._id}&flg=1`,
        row
      );

      if (res.status === 201) {

        dispatch(showSnackbar({
          message: 'Compliance approved successfully.',
          severity: 'success'
        }));

        onRefresh();
      }

    }
    catch {

      dispatch(showSnackbar({
        message: 'Approval failed.',
        severity: 'error'
      }));
    }
  };

  // Reject handler
  const handleReject = async (row) => {

    try {

      if (!window.confirm("Reject this compliance?")) return;

      const res = await axiosInstance.patch(
        `/api/comp/approve?id=${row._id}&flg=0`,
        row
      );

      if (res.status === 201) {

        dispatch(showSnackbar({
          message: 'Compliance rejected successfully.',
          severity: 'success'
        }));

        onRefresh();
      }

    }
    catch {

      dispatch(showSnackbar({
        message: 'Rejection failed.',
        severity: 'error'
      }));
    }
  };

  // Function to get row class based on date
  const getRowClass = (date) => {

    if (!date) return "";

    const today = moment().startOf("day");
    const compDate = moment(date, "YYYY-MM-DD").startOf("day");

    if (compDate.isBefore(today)) return "expired-row";

    if (compDate.isSame(today)) return "today-row";

    return "";
  };

  return (
    <>
        <table className="compliance-table">

        <thead>
          <tr>
            <th><b>ID</b></th>
            <th><b>PLANT</b></th>
            <th><b>DEPARTMENT</b></th>
            <th><b>APPLICABILITY</b></th>
            <th><b>TYPE</b></th>
            <th><b>CATEGORY</b></th>
            <th><b>FREQUENCY</b></th>
            <th><b>CRITICALITY</b></th>
            <th><b>PENALTY TYPE</b></th>
            <th><b>HEADER</b></th>
            <th><b>DATE</b></th>
            <th><b>STATUS</b></th>
            <th><b>APPROVAL</b></th>
            <th><b>CREATED ON</b></th>
            <th><b>ACTION</b></th>
          </tr>
        </thead>

        <tbody>

          {data.map((row, index) => {

            const rowClass = getRowClass(row.complianceDate);

            return (

              <tr
  key={index}
  className={`table-row ${rowClass}`}
  title={
    rowClass === "expired-row"
      ? "Compliance expired"
      : rowClass === "today-row"
      ? "Compliance due today"
      : ""
  }
>

                <td>{row.complianceId}</td>

                <td>{row.plantName}</td>

                <td>{row.departmentName}</td>

                <td className="fixed-cell">
                  {row.complianceApplicability}
                </td>

                <td>{row.complianceTypeName}</td>

                <td>{row.complianceCategoryName}</td>

                <td>{row.complianceFrequencyName}</td>

                <td>{row.criticalityName}</td>

                <td>{row.penaltyName}</td>

                <td>{row.complianceHeader}</td>

                <td>
                  {row.complianceDate
                    ? moment(row.complianceDate).format("DD-MM-YYYY")
                    : "-"
                  }
                </td>

                <td>{row.status}</td>

                <td>{row.approvalStatus}</td>

                <td>
                  {moment(row.createdAt)
                    .format("DD-MM-YYYY HH:mm:ss")
                  }
                </td>

                <td className="action-cell">

                  <button
                    className="icon-btn view"
                    onClick={() => handleView(row)}
                    title="View"
                    data-tooltip="View Compliance"
                  >
                    <RemoveRedEyeTwoToneIcon fontSize="small" />
                  </button>

                  <button
                    className="icon-btn download"
                    onClick={() => handleZipDownload(row.allDocs, row.complianceId)}
                    title="Download ZIP"
                    data-tooltip="Download ZIP"
                  >
                    <FolderArchive size={18} />
                  </button>

                  <button
                    className="icon-btn approve"
                    onClick={() => handleApprove(row)}
                    disabled={!row.isApprover}
                    title="Approve"
                    data-tooltip="Approve Compliance"
                  >
                    <PlaylistAddCheckTwoToneIcon fontSize="small" />
                  </button>

                  <button
                    className="icon-btn reject"
                    onClick={() => handleReject(row)}
                    disabled={!row.isApprover}
                    title="Reject"
                    data-tooltip="Reject Compliance"
                  >
                    <DoNotDisturbOnTwoToneIcon fontSize="small" />
                  </button>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

      {openView && (
        <ViewComplianceModal
          data={selectedCompliance}
          onClose={() => {
            setOpenView(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
