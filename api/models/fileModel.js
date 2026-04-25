import mongoose from "mongoose";

const { Schema, model } = mongoose;

const fileSchema = new Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    hash: { type: String, index: true }, // 🔥 important for duplicate detection
    documentId: { type: String, index: true }, // 🔥 NEW FIELD Referenced with certificateId from "certificate" model
}, { timestamps: true });

fileSchema.index({ hash: 1, documentId: 1 }, { unique: true });

export default mongoose.model("File", fileSchema);