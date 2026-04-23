// // ✅ Multer config
import multer from "multer";

const fileCounts = process.env.UPLD_COUNT ? parseInt(process.env.UPLD_COUNT) : 10;
const fileSizeMB = process.env.UPLD_SIZE_MB ? parseInt(process.env.UPLD_SIZE_MB) : 20;

const storage = multer.memoryStorage();

const fileUpload = multer({
    storage,
    limits: {
        files: fileCounts,
        fileSize: fileSizeMB * 1024 * 1024,
    },
});

export default fileUpload;