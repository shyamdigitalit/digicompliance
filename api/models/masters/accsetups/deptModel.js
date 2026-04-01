import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const DeptSchema = new Schema({
    departmentCode: { type: String, required: true, trim: true },
    departmentName: { type: String, required: true, trim: true },
    departmentDesc: { type: String },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, {
    timestamps: true
});

export default model('Department', DeptSchema);