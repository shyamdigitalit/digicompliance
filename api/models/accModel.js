import mongoose from 'mongoose';
import moment from 'moment'

const { Schema, model, Types } = mongoose;

const AccSchema = new Schema({
    acc_uname: { type: String, required: true, trim: true },
    acc_pass: { type: String, required: true, trim: true },
    acc_pass_bckup: { type: String, required: true, trim: true },
    acc_eml: { type: String, trim: true, default: '' },
    acc_phn: { type: String, trim: true, default: '' },
    acc_fname: { type: String, required: true, trim: true },
    acc_secphn: { type: String, trim: true },
    acc_typ: { type: Types.ObjectId, ref: 'Accounttype', required: true },
    acc_plnt: { type: Types.ObjectId, ref: 'Plant' },
    acc_comp: { type: String, trim: true },
    acc_dept: { type: Types.ObjectId, ref: 'Department' },
    acc_desig: { type: Types.ObjectId, ref: 'Designation' },
    acc_emp_code: { type: String, trim: true, default: '' },
    acc_addrss: { type: String, trim: true },
    acc_pan: { type: String, trim: true },
    acc_gst: { type: String, trim: true },
    acc_img: { type: String },
    acc_img_publicid: { type: String },
    acc_dob: { type: Date },
    acc_anniversary: { type: Date },
    acc_is_creator: { type: Boolean, required: true, enum: [true, false], default: true },
    acc_is_approver: { type: Boolean, required: true, enum: [true, false], default: false },
    acc_status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true });

export default model('Account', AccSchema);
