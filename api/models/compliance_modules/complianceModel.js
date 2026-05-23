import mongoose from "mongoose";
import moment from 'moment'

const { Schema, model, Types } = mongoose

const ComplianceSchema = new Schema({
    complianceId: { type: String, required: true, trim: true },
    plant: { type: Types.ObjectId, ref: 'Plant' },
    department: { type: Types.ObjectId, ref: 'Department' },
    complianceType: { type: Types.ObjectId, ref: 'Compliancetype' },
    complianceCategorization: { type: Types.ObjectId, ref: 'Compliancecategory' },
    complianceFrequency: { type: Types.ObjectId, ref: 'Compliancefrequency' },
    criticality: { type: Types.ObjectId, ref: 'Criticality' },
    penaltyType: { type: Types.ObjectId, ref: 'Penalty' },
    dueDate: { type: Date, required: true },
    legislation: { type: String, trim: true },
    complianceHeader: { type: String, trim: true },
    complianceDescription: { type: String, trim: true },
    complianceApplicability: { type: String, trim: true },
    additionalInformation: { type: String, trim: true },
    provision: { type: String, trim: true },
    complianceStatutoryAuthority: { type: String, trim: true },
    location: { type: String, trim: true },
    scheduledPeriodicity: { type: String, trim: true },
    remarks: { type: String, trim: true },
    allDocs: [{ type: Types.ObjectId, ref: "File" }],
    status: { type: String, required: true, enum: ['Open', 'Pending', 'Active', 'Inactive', 'Closed'], default: 'Active' }, // status
    createdby: { type: Types.ObjectId, ref: 'Account', required: true }, // master
    updatedby: { type: Types.ObjectId, ref: 'Account' }, // master
    creationdt: { type: String, required: true, trim: true, default: () => moment().format("DD-MM-YYYY") }, // date
    creationtm: { type: String, required: true, trim: true, default: () => moment().format("HH:mm:ss") }, // time
    approvalStatus: { type: String, required: true, default: 'Approved', trim: true }, // status
    currentPendingApprovalLevel: { type: Number, required: true, default: 0 }, // Current Approval Level
    approvalDetails: [{
        approvalLevel: { type: Number, required: true }, // text
        approvalOption: { type: String, required: true, enum: ['Approval', 'Rejection'], default: 'Approval' }, // option
        approver: { type: Types.ObjectId, ref: 'Account', required: true }, // master
        approvalDate: { type: String, required: true, trim: true, default: () => moment().format("DD-MM-YYYY") }, // date
        approvalTime: { type: String, required: true, trim: true, default: () => moment().format("HH:mm:ss") }, // time
        approvalRemarks: { type: String, trim: true } // text
    }]
}, { timestamps: true })

/* 🔥🔥🔥 INDEXES (CRITICAL & OPTIMIZED) */

/* 🔥🔥🔥 COMPOUND INDEXES (OPTIMIZED FOR REAL QUERIES) */

/**
 * 1️⃣ Dashboard / Listing
 * Filters by plant, department, status + sorted by latest
 */
ComplianceSchema.index({
    plant: 1,
    department: 1,
    status: 1,
    createdAt: -1
})

/**
 * 2️⃣ Approval workflow queue
 * Used for "Pending approvals" screens
 */
ComplianceSchema.index({
    approvalStatus: 1,
    currentPendingApprovalLevel: 1,
    department: 1
})

/**
 * 3️⃣ User-specific data (My compliances / audit logs)
 */
ComplianceSchema.index({
    createdby: 1,
    status: 1,
    createdAt: -1
})

/**
 * 4️⃣ Compliance master uniqueness (business-level)
 * Prevents duplicate compliance per plant + department
 */
ComplianceSchema.index(
    {
        complianceId: 1,
        plant: 1,
        department: 1
    },
    { unique: true }
)

/**
 * 5️⃣ Reporting & analytics
 * Used for filters like frequency + criticality + status
 */
ComplianceSchema.index({
    complianceFrequency: 1,
    criticality: 1,
    status: 1
})

export default model('Compliance', ComplianceSchema)