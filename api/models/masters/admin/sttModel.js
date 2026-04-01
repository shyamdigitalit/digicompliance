import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const SttSchema = new Schema({
    stt_code: { type: String, required: true, unique: true, trim: true },
    stt_name: { type: String, required: true, trim: true },
    stt_desc: { type: String, trim: true },
    stt_captl: { type: String, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true });

export default model("State", SttSchema);