// fileOpController.js

import {
    uploadFiles,
    getFiles,
    getFileById,
    downloadFilesZip,
    removeFile,
    deleteFiles
} from "../utilities/fileOperations.js";

/* ------------------------------------------------------------------
   ✅ Upload Multiple Files
------------------------------------------------------------------ */
const uploadHandler = async (req, res) => {
    try {
        if (!req.files?.files || req.files?.files?.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        const files = req.files?.files || [];
        const result = await uploadFiles([].concat(files));
        return res.status(200).json({
            success: true,
            message: result.duplicates.length > 0
                ? "Files uploaded with duplicate reuse"
                : "Files uploaded successfully",
            uploadedCount: result.uploaded.length,
            duplicateCount: result.duplicates.length,
            duplicateFiles: result.duplicates,
            file: result.uploaded[0] || null
        });
    } catch (error) {
        console.error("Upload Handler Error:", error);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
};

/* ------------------------------------------------------------------
   ✅ Get All Uploaded Files
------------------------------------------------------------------ */
const getAllHandler = async (req, res) => {
    try {
        const files = await getFiles();
        return res.status(200).json({
            success: true,
            count: files.length,
            files
        });
    } catch (error) {
        console.error("Get All Files Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch files",
            error: error.message
        });
    }
};

/* ------------------------------------------------------------------
   ✅ Fetch Single File
------------------------------------------------------------------ */
const getByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { file, stream } = await getFileById(id);
        res.set({
            "Content-Disposition": `attachment; filename="${file.originalname}"`,
            "Content-Type": file.mimetype,
            "Content-Length": file.size
        });
        stream.pipe(res);
    } catch (error) {
        console.error("Fetch File Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

/* ------------------------------------------------------------------
   ✅ Download Multiple Files as ZIP
   Example:
   /api/files/download-zip?files=id1,id2,id3
------------------------------------------------------------------ */
const downloadAllHandler = async (req, res) => {
    try {
        const fileIds = req.query.files
            ? req.query.files.split(",").filter(Boolean)
            : [];

        if (!fileIds.length) {
            return res.status(400).json({
                success: false,
                message: "No file IDs provided"
            });
        }

        const zipStream = await downloadFilesZip(fileIds);
        res.set({
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="Files_${Date.now()}.zip"`
        });
        zipStream.pipe(res);
    } catch (error) {
        console.error("ZIP Download Error:", error);
        return res.status(500).json({
            success: false,
            message: "ZIP download failed",
            error: error.message
        });
    }
};

/* ------------------------------------------------------------------
   ✅ Delete Single File
------------------------------------------------------------------ */
const deleteHandler = async (req, res) => {
    try {
        const { fileId } = req.params;
        const result = await removeFile(fileId);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Delete File Error:", error);
        return res.status(500).json({
            success: false,
            message: "Delete failed",
            error: error.message
        });
    }
};

/* ------------------------------------------------------------------
   ✅ Delete Multiple Files
   req.body = { ids: [] }
------------------------------------------------------------------ */
const deleteManyHandler = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "File IDs required"
            });
        }

        const results = await deleteFiles(ids);

        return res.status(200).json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        console.error("Bulk Delete Error:", error);

        return res.status(500).json({
            success: false,
            message: "Bulk delete failed",
            error: error.message
        });
    }
};


export default {
    uploadHandler,
    getAllHandler,
    getByIdHandler,
    downloadAllHandler,
    deleteHandler,
    deleteManyHandler
}