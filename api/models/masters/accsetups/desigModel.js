import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const DesigSchema = new Schema({
    designationCode: { type: String, required: true, trim: true },
    designationName: { type: String, required: true, trim: true },
    designationDesc: { type: String },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, {
    timestamps: true
});

export default model('Designation', DesigSchema);