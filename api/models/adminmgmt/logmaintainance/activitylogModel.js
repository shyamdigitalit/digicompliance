import mongoose from "mongoose";
const { Schema, model, Types } = mongoose

const ActivitylogSchema = new Schema({
    activityCode: { type: String, required: true, trim: true },
    activityName: { type: String, required: true, trim: true },
    activityDescription: { type: String, trim: true },
    activityReferenceFunction: { type: Types.ObjectId, ref: "Function", required: true },
    activityReferenceCollection: { type: String, trim: true },
    activityReferenceUniqueFieldName: { type: String, trim: true },
    activityReferenceUniqueFieldValue: { type: String, trim: true },
    activityReferenceInfo: { type: String, trim: true },
    activityReferenceBy: { type: Types.ObjectId, ref: "Account", required: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true })

ActivitylogSchema.index({ activityCode: 1 }, { unique: true });
ActivitylogSchema.index({ updatedAt: -1 });

const activitylogModel = model("Activitylog", ActivitylogSchema)
export default activitylogModel