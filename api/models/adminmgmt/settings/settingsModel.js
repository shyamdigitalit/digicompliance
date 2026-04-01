import mongoose from "mongoose";

const { Schema, model, Types } = mongoose

const SettingsSchema = new Schema({
    _id: { type: String, default: 'APP_SETTINGS' },
    notifTime: {  type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true })

export default model('Settings', SettingsSchema)