import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const ProvdrSchema = new Schema(
  {
    providerCode: { type: String, required: true },
    providerName: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
  }, { timestamps: true }
);

export default model('Provider', ProvdrSchema);