import mongoose from "mongoose";

const { Schema, model, Types } = mongoose

// Most Optimised Denormalized Approach ==============================================================
// const ApproverAccountSchema = new Schema({
//     approverId: { type: Types.ObjectId, ref: 'Account', required: true },
//     // snapshot fields
//     approverUsername: { type: String, required: true },
//     approverFullname: { type: String, required: true },
// }, { _id: true });
// const ApproverSchema = new Schema({
//     approverAccount: ApproverAccountSchema,
//     approverAbbreviation: { type: String, trim: true },
//     approverRole: { type: String, trim: true }
// }, { _id: true });
// const ApprovalStepSchema = new Schema({
//     approvalLevel: { type: Number, required: true },
//     approvalTitle: { type: String, required: true },
//     approvalTag: { type: String, required: true },
//     approvers: [ApproverSchema]
// }, { _id: true });

// const DynapprvlSchema = new Schema({
//     approvalCode: { type: String, required: true, trim: true },
//     // plant snapshot
//     approvalCreatorBaseId: { type: Types.ObjectId, ref: 'Plant', required: true },
//     plantCode: { type: String, required: true },
//     plantName: { type: String, required: true },
//     // department snapshot
//     approvalFunctionId: { type: Types.ObjectId, ref: 'Department', required: true },
//     departmentCode: { type: String, required: true },
//     departmentName: { type: String, required: true },

//     approvalDetails: [ApprovalStepSchema],

//     status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
//     createdById: { type: Types.ObjectId, ref: 'Account', required: true },
//     createdByName: { type: String, required: true },

//     updatedById: { type: Types.ObjectId, ref: 'Account' },
//     updatedByName: { type: String }
// }, { timestamps: true });

// DynapprvlSchema.index({ approvalCreatorBaseId: 1, approvalFunctionId: 1, updatedAt: -1 }, { unique: true })
// DynapprvlSchema.index({ approvalCode: 1 }, { unique: true })
// DynapprvlSchema.index({ plantCode: 1, departmentCode: 1 })
// DynapprvlSchema.index({ status: 1 })



// Normalized Approach (Less Optimized, More Flexible) ==========================================================
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

// DynapprvlSchema.index({ approvalCreatorBase: 1, approvalFunction: 1, updatedAt: -1 }, { unique: true })
DynapprvlSchema.index({ approvalCode: 1 }, { unique: true })
DynapprvlSchema.index({
    approvalCreatorBase: 1,
    approvalFunction: 1
}, {
    unique: true,
    partialFilterExpression: {
        approvalCreatorBase: { $exists: true },
        approvalFunction: { $exists: true }
    }
})
DynapprvlSchema.index({ status: 1 })


const dynapprvlModel = model('Dynamicapproval', DynapprvlSchema);
export default dynapprvlModel;
