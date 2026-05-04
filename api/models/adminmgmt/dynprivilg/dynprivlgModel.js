import mongoose from "mongoose";

const { Schema, model, Types } = mongoose

const ActivitySchema = new Schema({
    name: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    heirarchy: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

const DynprivlgSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    functionId: { type: Types.ObjectId, ref: 'Function', required: true },
    functionName: { type: String, required: true },
    functionPath: { type: String, trim: true },
    functionQuery: { type: String, trim: true },
    functionHeirarchy: { type: Number, required: true, default: 0 },
    activities: [{ type: ActivitySchema }],
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

DynprivlgSchema.index({ code: 1 }, { unique: true })
DynprivlgSchema.index({ functionId: 1 })
DynprivlgSchema.index({ status: 1 })

export default model('Dynamicprivilege', DynprivlgSchema)