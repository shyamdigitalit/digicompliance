import { uploadFile, deleteFile } from "../configs/fileStorage.js";

export const uploadFiles = async (files = [], documentId) => {
    const uploaded = [];
    const duplicates = [];

    await Promise.allSettled(
        files.map(async (f) => {
        try {
            const res = await uploadFile( f.buffer, f.originalname, f.mimetype, documentId );

            if (res.duplicate) {
                duplicates.push(f.originalname);
            } else if (res?.file) {
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
        }
        })
    );

    return { uploaded, duplicates };
};

export const deleteFiles = async (ids = []) => {
    const results = [];

    await Promise.allSettled(
        ids.map(async (id) => {
            try {
                const res = await deleteFile(id);
                results.push(res);
            } catch (e) {
                console.error("Delete error:", e);
            }
        })
    );

    return results;
};