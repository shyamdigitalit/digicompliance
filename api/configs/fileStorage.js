import fs from "fs";
import path from "path";
import crypto from "crypto";
import archiver from "archiver";
import File from "../models/fileModel.js";
import mongoose from "mongoose";

const BASE_UPLOAD_DIR = path.join(process.cwd(), "uploads");

/* ------------------------------------------------------------------
  ✅ Ensure directory exists
------------------------------------------------------------------ */
const ensureDir = async (dirPath) => {
    await fs.promises.mkdir(dirPath, { recursive: true });
};
/* ------------------------------------------------------------------
   Safe path check
------------------------------------------------------------------ */
const isSafePath = (targetPath) => {
    const resolved = path.resolve(targetPath);
    return resolved.startsWith(BASE_UPLOAD_DIR);
};
/* ------------------------------------------------------------------
   Generate unique filename if same name exists with different content
------------------------------------------------------------------ */
const generateUniqueFilename = async (dir, filename) => {
    let ext = path.extname(filename);
    let base = path.basename(filename, ext);

    let counter = 1;
    let newName = filename;
    let fullPath = path.join(dir, newName);

    while (fs.existsSync(fullPath)) {
        newName = `${base}_${counter}${ext}`;
        fullPath = path.join(dir, newName);
        counter++;
    }

    return newName;
};
// --------------------------------------------------------------------------------------------------------------------------------------------------

/* ------------------------------------------------------------------
   ✅ 1. Upload file with duplicate prevention
------------------------------------------------------------------ */
export const uploadFile = async (buffer, originalname, mimetype) => {
    const hash = crypto.createHash("sha512").update(buffer).digest("hex");

    /* --------------------------------------------------------------
       If already exists -> return existing file reference
    -------------------------------------------------------------- */
    const existing = await File.findOne({ hash });

    if (existing) return { duplicate: true, file: existing };
    else {
        /* --------------------------------------------------------------
            New file upload
        -------------------------------------------------------------- */
        const docDir = path.join(BASE_UPLOAD_DIR);
        await ensureDir(docDir);

        const safeName = originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");

        const filename = `${Date.now()}_${safeName}`;
        const filePath = path.join(docDir, filename);

        await fs.promises.writeFile(filePath, buffer);

        const fileDoc = await File.create({
            filename,
            originalname,
            mimetype,
            size: buffer.length,
            path: filePath,
            hash
        });

        return { duplicate: false, file: fileDoc };
    }
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
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error("Invalid file ID");
    }

    const file = await File.findById(fileId).lean();

    if (!file) throw new Error("File not found");

    if (!isSafePath(file.path)) {
        throw new Error("Invalid file path");
    }

    if (!fs.existsSync(file.path)) {
        throw new Error("File missing on server");
    }

    return { file, stream: fs.createReadStream(file.path) };
};

/* ------------------------------------------------------------------
   ✅ 4. Get ZIP stream
------------------------------------------------------------------ */
export const getZipStream = async (fileIds = []) => {
    if (!Array.isArray(fileIds) || !fileIds.length) {
        throw new Error("No file IDs provided");
    }

    const validIds = fileIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
    );

    const files = await File.find({
        _id: { $in: validIds }
    }).lean();

    const archive = archiver("zip", {
        zlib: { level: 9 }
    });

    const usedNames = new Set();

    for (const file of files) {
        if (!isSafePath(file.path)) continue;
        if (!fs.existsSync(file.path)) continue;

        let zipName = file.originalname;
        let counter = 1;

        while (usedNames.has(zipName)) {
            const ext = path.extname(file.originalname);
            const base = path.basename(file.originalname, ext);

            zipName = `${base}(${counter})${ext}`;
            counter++;
        }

        usedNames.add(zipName);

        archive.file(file.path, { name: zipName });
    }

    process.nextTick(() => archive.finalize());

    return archive;
};

/* ------------------------------------------------------------------
   ✅ 5. Hard delete file (ONLY if really needed)
------------------------------------------------------------------ */
export const deleteFile = async (fileId) => {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error("Invalid file ID");
    }

    const file = await File.findById(fileId);

    if (!file) {
        return { message: "File not found" };
    }

    if (!isSafePath(file.path)) {
        throw new Error("Invalid file path");
    }

    /* --------------------------------------------------------------
       Delete physical file
    -------------------------------------------------------------- */
    if (fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
    }

    /* --------------------------------------------------------------
       Delete DB record
    -------------------------------------------------------------- */
    await File.findByIdAndDelete(fileId);

    return { message: "File deleted successfully", _id: fileId };
};