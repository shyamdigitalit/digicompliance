import mongoose from "mongoose";
const { Schema, model, Types } = mongoose

const CompcategSchema = new Schema({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    desc: { type: String, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

CompcategSchema.index({ code: 1 }, { unique: true })
CompcategSchema.index({ name: 1 }, { unique: true })
CompcategSchema.index({ status: 1 })

export default model('Compliancecategory', CompcategSchema)