import mongoose from "mongoose";

const { Schema } = mongoose;

const fileSchema = new Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    relativePath: String,
    hash: String
}, { timestamps: true });

fileSchema.index({ hash: 1 }, { unique: true });

export default mongoose.model("File", fileSchema);