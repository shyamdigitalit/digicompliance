import mongoose from "mongoose";
const { Schema, model, Types } = mongoose

const CompfreqSchema = new Schema({
    complianceFrequencyName: { type: String, required: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

export default model('Compliancefrequency', CompfreqSchema)