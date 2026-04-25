import fs from "fs";
import path from "path";
import crypto from "crypto";
import archiver from "archiver";
import File from "../models/fileModel.js";

const BASE_UPLOAD_DIR = path.join(process.cwd(), "uploads");

/* ------------------------------------------------------------------
  ✅ Ensure directory exists
------------------------------------------------------------------ */
const ensureDir = async (dirPath) => {
    await fs.promises.mkdir(dirPath, { recursive: true });
};

/* ------------------------------------------------------------------
  ✅ 1. Upload with coil-based folder + duplicate prevention
------------------------------------------------------------------ */
export const uploadFile = async (buffer, originalname, mimetype, documentId='') => {
    if (!documentId) throw new Error("documentId is required");

    const hash = crypto.createHash("sha512").update(buffer).digest("hex");

    // 🔥 Duplicate check INSIDE SAME COIL ONLY
    const existing = await File.findOne({ hash, documentId });
    if (existing) {
        return { duplicate: true, file: existing };
    }

    // ✅ Create folder: /uploads/<documentId>/
    const docDir = path.join(BASE_UPLOAD_DIR, documentId);
    await ensureDir(docDir);

    // ✅ Custom filename
    const ext = path.extname(originalname);
    const safeName = originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");

    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(docDir, filename);

    // ✅ Save file
    await fs.promises.writeFile(filePath, buffer);

    // ✅ Save metadata
    const fileDoc = await File.create({
        filename,
        originalname,
        mimetype,
        size: buffer.length,
        path: filePath,
        hash,
        documentId,
    });

    return { duplicate: false, file: fileDoc };
};

/* ------------------------------------------------------------------
  ✅ 2. Get all uploaded files metadata
------------------------------------------------------------------ */
export const getAllFiles = async () => {
    return File.find().sort({ createdAt: -1 }).lean();
};

/* ------------------------------------------------------------------
  ✅ 3. Get single file stream
------------------------------------------------------------------ */
export const getFileStream = async (fileId) => {
    const file = await File.findById(fileId).lean();
    if (!file) throw new Error("File not found");

    // 🔒 Security: ensure path is inside uploads folder
    const normalizedPath = path.normalize(file.path);
    if (!normalizedPath.startsWith(BASE_UPLOAD_DIR)) {
        throw new Error("Invalid file path");
    }

    // ❌ File missing on disk
    if (!fs.existsSync(normalizedPath)) {
        throw new Error("File missing on server");
    }

    const stream = fs.createReadStream(normalizedPath);

    return { file, stream };
};

/* ------------------------------------------------------------------
  ✅ 4. Get ZIP stream for multiple files
------------------------------------------------------------------ */
export const getZipStream = async (fileIds) => {
    if (!Array.isArray(fileIds) || !fileIds.length) {
        throw new Error("No file IDs provided");
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    const files = await File.find({ _id: { $in: fileIds } }).lean();

    const usedNames = new Set();

    files.forEach((file) => {
        const filePath = path.normalize(file.path);

        if (
            filePath.startsWith(BASE_UPLOAD_DIR) &&
            fs.existsSync(filePath)
        ) {
            // 🔥 Handle duplicate filenames in ZIP
            let name = file.originalname;
            let counter = 1;

            while (usedNames.has(name)) {
                const ext = path.extname(file.originalname);
                const base = path.basename(file.originalname, ext);
                name = `${base}(${counter})${ext}`;
                counter++;
            }

            usedNames.add(name);

            archive.file(filePath, { name });
        }
    });

    process.nextTick(() => archive.finalize());

    return archive;
};

/* ------------------------------------------------------------------
  ✅ 5. Delete file by ID
------------------------------------------------------------------ */
export const deleteFile = async (fileId) => {
    const file = await File.findById(fileId);
    if (!file) return;

    const filePath = path.normalize(file.path);

    // 🔒 Security check
    if (!filePath.startsWith(BASE_UPLOAD_DIR)) {
        throw new Error("Invalid file path");
    }

    // ✅ Delete file from disk
    if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
    }

    // ✅ Delete from DB
    await File.findByIdAndDelete(fileId);

    // 🔥 OPTIONAL: Remove folder if empty
    const dir = path.dirname(filePath);
    try {
        const filesLeft = await fs.promises.readdir(dir);
        if (filesLeft.length === 0) {
            await fs.promises.rmdir(dir);
        }
    } catch (err) {
        console.error("Folder cleanup error:", err);
    }

    return { message: "File deleted successfully", _id: fileId };
};