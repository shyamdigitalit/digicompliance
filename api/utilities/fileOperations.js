import {
    uploadFile,
    getAllFiles,
    getFileStream,
    getZipStream,
    deleteFile
} from "../configs/fileStorage.js";

/* ------------------------------------------------------------------
   ✅ Upload multiple files
------------------------------------------------------------------ */
export const uploadFiles = async (files = []) => {
    const uploaded = [];
    const duplicates = [];

    await Promise.allSettled(
        files.map(async (f) => {
            try {
                const res = await uploadFile( f.buffer, f.originalname, f.mimetype );

                /* --------------------------------------------------
                   If duplicate found:
                   - Do not create file again
                   - But attach existing file info to compliance data
                -------------------------------------------------- */
                if (res?.duplicate && res?.file) {
                    console.log('x1');
                    duplicates.push(f.originalname);

                    uploaded.push({
                        filId: res.file._id,
                        filName: res.file.originalname,
                        filContentType: res.file.mimetype,
                        filContentSize: res.file.size,
                        filPath: res.file.path,
                        filUploadStatus: "Done",
                    });
                }

                /* --------------------------------------------------
                   New uploaded file
                -------------------------------------------------- */
                else if (res?.file) {
                    console.log('x2');
                    uploaded.push({
                        filId: res.file._id,
                        filName: res.file.originalname,
                        filContentType: res.file.mimetype,
                        filContentSize: res.file.size,
                        filPath: res.file.path,
                        filUploadStatus: "Done",
                    });
                }

            } catch (err) {
                console.error("Upload error:", err);

                uploaded.push({
                    filId: null,
                    filName: f.originalname,
                    filContentType: f.mimetype,
                    filContentSize: f.size || 0,
                    filPath: null,
                    filUploadStatus: "Failed",
                });
            }
        })
    );

    return { uploaded, duplicates };
};


/* ------------------------------------------------------------------
   ✅ Get all files
------------------------------------------------------------------ */
export const getFiles = async () => {
    return await getAllFiles();
};

/* ------------------------------------------------------------------
   ✅ Download single file
------------------------------------------------------------------ */
export const downloadFile = async (fileId) => {
    return await getFileStream(fileId);
};

/* ------------------------------------------------------------------
   ✅ Download multiple files ZIP
------------------------------------------------------------------ */
export const downloadFilesZip = async (ids = []) => {
    return await getZipStream(ids);
};

/* ------------------------------------------------------------------
   ✅ Delete single file
------------------------------------------------------------------ */
export const removeFile = async (fileId) => {
    return await deleteFile(fileId);
};

/* ------------------------------------------------------------------
   ✅ Delete multiple files
------------------------------------------------------------------ */
export const deleteFiles = async (ids = []) => {
    const results = [];

    await Promise.allSettled(
        ids.map(async (id) => {
            try {
                const res = await deleteFile(id);
                results.push({
                    success: true,
                    ...res
                });
            } catch (err) {
                results.push({
                    success: false,
                    _id: id,
                    message: err.message
                });
            }
        })
    );

    return results;
};