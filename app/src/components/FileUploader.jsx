import React, { useRef } from "react";

const FileUploader = ({ files, setFiles, disabled = false }) => {
  const inputRef = useRef(null);

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  /* ============================
      HANDLE NEW FILE SELECTION
  ============================ */
  const processFiles = (fileList) => {
    if (disabled) return;

    const selectedFiles = Array.from(fileList);

    const validFiles = selectedFiles
      .filter((file) => allowedTypes.includes(file.type))
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        isExisting: false,
        file,
      }));

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFiles = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  /* ============================
      DRAG & DROP
  ============================ */
  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  /* ============================
      REMOVE FILE
  ============================ */
  const removeFile = (index) => {
    if (disabled) return;

    const fileToRemove = files[index];

    if (fileToRemove.isExisting) {
      console.log("Deleting existing file from backend:", fileToRemove.id);
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ============================
      FILE PREVIEW ICON
  ============================ */
  const renderPreview = (file) => {
    if (file?.type?.startsWith("image/")) {
      return (
        <img
          src={
            file.isExisting
              ? `/api/files/${file.id}`
              : URL.createObjectURL(file.file)
          }
          alt=""
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "10px",
          background: "#e2f0ed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          color: "#476962",
          fontSize: "13px",
        }}
      >
        {file?.type?.includes("pdf")
          ? "PDF"
          : file?.type?.includes("spreadsheet")
          ? "XLSX"
          : "FILE"}
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "550px",
        margin: "1rem",
        padding: "20px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.4)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        opacity: disabled ? 0.6 : 1,
      }}
      aria-disabled={disabled}
    >
      {/* ============================
          UPLOAD AREA
      ============================ */}
      <div
        onClick={() => !disabled && inputRef.current.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: "2px dashed rgba(0,0,0,0.25)",
          padding: "40px 20px",
          borderRadius: "16px",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "0.25s",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
          Click or Drop Files Here
        </div>
        <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
          Images, PDF, Excel • Multiple Allowed
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx"
        style={{ display: "none" }}
        onChange={handleFiles}
        disabled={disabled}
      />

      {/* ============================
          FILE LIST
      ============================ */}
      <div style={{ marginTop: "20px" }}>
        {files.map((file, index) => (
          <div
            key={file.id || index}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.8)",
              boxShadow: "0 5px 14px rgba(0,0,0,0.06)",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            {renderPreview(file)}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>
                {file.name}
              </div>
              <div style={{ fontSize: "12px", color: "#648b81" }}>
                {(file.size / 1024).toFixed(1)} KB
                {file.isExisting && " • Uploaded"}
              </div>
            </div>

            {!disabled && (
              <button
                onClick={() => removeFile(index)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
