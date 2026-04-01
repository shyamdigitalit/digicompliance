import React from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  Divider,
  CardActionArea,
} from "@mui/material";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from "@mui/icons-material/Delete";
import FolderZipIcon from '@mui/icons-material/FolderZip';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import axiosInstance from "../config/axiosInstance";
// import { useDispatch } from "react-redux";
// import { showSnackbar } from "../redux/slices/snackbar";

const MultiFileUploader = ({
  // name = "file_uploads",
  label = "Upload Files",
  value = [],
  onChange,
  maxFiles = 10,
  maxSizeMB = 10,
  allowDuplicates = false,
}) => {
  // const dispatch = useDispatch()
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

  // ✅ Handle new file selection
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // Check file size and count limits
    const overSized = newFiles.filter((f) => f.size / 1024 / 1024 > maxSizeMB);
    if (overSized.length > 0) {
      setAlert({
        open: true,
        message: `Some files exceed ${maxSizeMB} MB limit and were skipped!`,
        severity: "warning",
      });
    }

    const validFiles = newFiles.filter((f) => f.size / 1024 / 1024 <= maxSizeMB);

    // ✅ Apply duplicate restriction only if allowDuplicates === false
    let finalFiles;
    if (allowDuplicates) {
      finalFiles = [...value, ...validFiles];
    } 
    else {
      const nonDuplicateFiles = validFiles.filter(
        (file) => !value.some(
          (existing) =>
            (existing.name || existing.filName)?.toLowerCase() ===
            file.name.toLowerCase()
        )
      );

      if (nonDuplicateFiles.length < validFiles.length) {
        setAlert({
          open: true,
          message: "Duplicate filenames were skipped!",
          severity: "warning",
        });
      }

      finalFiles = [...value, ...nonDuplicateFiles];
    }

    if (finalFiles.length > maxFiles) {
      setAlert({
        open: true,
        message: `Maximum ${maxFiles} files allowed!`,
        severity: "error",
      });
      return;
    }

    onChange(finalFiles);
    e.target.value = null; // reset input
  };

  const handleDownload = async (file) => {
    try {
      if (file instanceof File) {
        // 🟢 Local file (not yet uploaded)
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      else if (file.filUrl) {
        // 🟢 Already uploaded file (e.g. from backend)
        const link = document.createElement("a");
        link.href = file.filUrl;
        link.download = file.name || "download";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else if (file.filId) {
        // 🟢 Already uploaded and stored file in db (e.g. from backend)
        try {
          const response = await axiosInstance.get(`/api/file/download/${file.filId}`, {
            responseType: 'blob',
          });

          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = file.name || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        } catch (err) {
          console.error('Download failed:', err);
          setAlert({
            open: true,
            message: "Error downloading file!",
            severity: "error",
          });
        }
      }
      else {
        setAlert({
          open: true,
          message: `No download link available for this file!`,
          severity: "error",
        })
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // ✅ Remove a file
  const handleRemove = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleZipDownload = async () => {
    if (value.length === 0) {
      setAlert({
        open: true,
        message: "No files available for download!",
        severity: "warning",
      });
      return;
    }
 
    try {
      const backendFiles = value.filter(f => f.filId);
      const localFiles = value.filter(f => f instanceof File);
      const urlFiles = value.filter(f => f.filUrl && !f.filId);

      if (backendFiles.length > 0) {
        // 🟢 Fetch from backend as one combined ZIP
        try {
          const fileIds = backendFiles.map(f => f.filId).join(',');
          const response = await axiosInstance.get(`/api/file/downloadall?files=${fileIds}`, {
            responseType: 'blob',
          });

          const blob = new Blob([response.data], { type: 'application/zip' });
          saveAs(blob, `${String(label).split(' ').join('_')}.zip`);
          setAlert({
            open: true,
            message: "All files downloaded as ZIP!",
            severity: "success",
          });
          return;
        } catch (err) {
          console.error('Backend zip download failed:', err);
          setAlert({
            open: true,
            message: "Error while fetching ZIP from backend!",
            severity: "error",
          });
        }
      }

      // 🟢 Otherwise, fallback to local/URL files (as before)
      const zip = new JSZip();
      for (const file of localFiles) {
        zip.file(file.name, file);
      }
      for (const file of urlFiles) {
        const response = await fetch(file.filUrl);
        const blob = await response.blob();
        zip.file(file.filName || "downloaded_file", blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${String(label).split(' ').join('_')}.zip`);
 
      setAlert({
        open: true,
        message: "All files downloaded as ZIP!",
        severity: "success",
      });
    } catch (err) {
      console.error("Zip download error:", err);
      setAlert({
        open: true,
        message: "Error while creating ZIP file!",
        severity: "error",
      });
    }
  };

  return (
    <Card sx={{ display: "flex", justifyContent: "center", width: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          {/* Select Button */}
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Select Files
            <input type="file" multiple hidden onChange={handleFileChange} />
          </Button>

          {/* Zipped Download */}
          <IconButton
            edge="end"
            color="info"
            onClick={handleZipDownload}
            title="Download all as ZIP"
          >
            <FolderZipIcon />
          </IconButton>
        </Box>

        {/* List of files */}
        {value.length > 0 && (
          <Box sx={{ mt: 2, p: 1 }}>
            {value.map((file, index) => (
              <Box key={index} divider sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexFlow: 'row wrap',
                width: 'auto',
                p: 1,
                boxShadow: '0.1rem 0.1rem 0.5rem #749f8cff'
              }}>
                <Box sx={{ p: 1 }}>
                  <Box sx={{ p: 1, fontSize: '1rem' }}>
                    {file.name || file.filName || "Unknown File"}
                  </Box>
                  <Box sx={{ p: 1, fontSize: '0.75rem' }}>
                    {
                      file.size
                        ? `${(file.size / 1024).toFixed(2)} KB`
                        : file.filContentSize
                        ? `${(Number(file.filContentSize) / 1024).toFixed(2)} KB`
                        : "0.00 KB"
                    }
                  </Box>
                </Box>

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: '0.5rem',
                  boxShadow: '0.05rem 0.05rem 2rem #b0d9c7ff inset'
                }}>
                  <IconButton edge="end" color="success" title="Download" onClick={() => handleDownload(file)} sx={{ margin: '0.1rem' }}>
                    <FileDownloadIcon />
                  </IconButton>
                  <IconButton edge="end" color="error" title="Remove" onClick={() => handleRemove(index)} sx={{ margin: '0.1rem' }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Alerts */}
        <Snackbar
          open={alert.open}
          autoHideDuration={3000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setAlert({ ...alert, open: false })}
            severity={alert.severity}
            sx={{ width: "100%" }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default MultiFileUploader;
