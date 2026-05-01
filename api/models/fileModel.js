import mongoose from "mongoose";

const { Schema, model } = mongoose;

const fileSchema = new Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    hash: String
}, { timestamps: true });

fileSchema.index({ hash: 1 }, { unique: true });

export default mongoose.model("File", fileSchema);