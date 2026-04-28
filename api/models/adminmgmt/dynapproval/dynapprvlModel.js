import mongoose from "mongoose";

const { Schema, model, Types } = mongoose

const DynapprvlSchema = new Schema({
    approvalCode: { type: String, required: true, trim: true },
    approvalCreatorBase: { type: Types.ObjectId, ref: 'Plant', required: true },
    approvalFunction: { type: Types.ObjectId, ref: 'Department', required: true },
    approvalDetails: [{
        approvalLevel: { type: Number, required: true, trim: true },
        approvalTitle: { type: String, trim: true },
        approvalTag: { type: String, trim: true },
        approvers: [{
            approverAccount: { type: Types.ObjectId, ref: 'Account', required: true },
            approverAbbreviation: { type: String, trim: true },
            approverRole: { type: String, trim: true }
        }]
    }],
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

DynapprvlSchema.index({ approvalCreatorBase: 1, approvalFunction: 1 }, { unique: true })

const dynapprvlModel = model('Dynamicapproval', DynapprvlSchema);
export default dynapprvlModel;