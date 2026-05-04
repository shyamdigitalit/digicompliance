import mongoose from "mongoose";

const { Schema, model, Types } = mongoose

const FuncSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    path: { type: String, trim: true },
    query: { type: String, trim: true },
    heirarchy: { type: Number, required: true, default: 0 },
    icon: { type: String, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

export default model('Function', FuncSchema)