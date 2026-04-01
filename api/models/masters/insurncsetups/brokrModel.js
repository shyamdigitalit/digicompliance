import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const BrokrSchema = new Schema(
  {
    brokerCode: { type: String, required: true },
    brokerName: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
  }, { timestamps: true }
);

export default model('Broker', BrokrSchema);