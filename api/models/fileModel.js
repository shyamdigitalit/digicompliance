import mongoose from "mongoose";

const { Schema, model } = mongoose;

const fileSchema = new Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    hash: String,
    // complianceId: { type: Schema.Types.ObjectId, ref: "Compliance" },
}, { timestamps: true });

fileSchema.index({ hash: 1 }, { unique: true });
fileSchema.index({ complianceId: 1 });

export default mongoose.model("File", fileSchema);