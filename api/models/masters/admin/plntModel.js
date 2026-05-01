import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const PlntSchema = new Schema({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    desc: { type: String, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true });

PlntSchema.index({ code: 1 }, { unique: true });
PlntSchema.index({ name: 1 }, { unique: true });
PlntSchema.index({ status: 1 });

export default model('Plant', PlntSchema);