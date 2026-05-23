import mongoose from 'mongoose';
import moment from 'moment';

import complianceModel from '../../models/compliance_modules/complianceModel.js';
import dynapprvlModel from '../../models/adminmgmt/dynapproval/dynapprvlModel.js';
import plntModel from '../../models/masters/admin/plntModel.js';
import deptModel from '../../models/masters/accsetups/deptModel.js';

// import { uploadFile, uploadUniqueFile, deleteFile } from '../../utilities/fileOperations.js';
import { uploadFiles, deleteFiles } from '../../utilities/fileOperations.js';
import { isValidObjectId } from '../../utilities/isValidObjectId.js';
import { safeJSONParse } from '../../utilities/safeJSONParse.js';
import { fetchApprovalDetails } from '../adminmgmt/dynapproval/dynapprvlController.js';
// import { mailConfig } from '../../configs/mailConfig.js';

/* ======================================================
   Helpers
====================================================== */

const toObjectId = v => (isValidObjectId(v) ? new mongoose.Types.ObjectId(v) : null);

const mapIds = payload => ({
    plant: toObjectId(payload.plant),
    department: toObjectId(payload.department),
    complianceType: toObjectId(payload.complianceType),
    complianceCategorization: toObjectId(payload.complianceCategorization),
    complianceFrequency: toObjectId(payload.complianceFrequency),
    criticality: toObjectId(payload.criticality),
    penaltyType: toObjectId(payload.penaltyType)
});

export const checkApprover = async (user) => {
    const accPlnt = user?.acc_plnt?._id ? toObjectId(user.acc_plnt._id) : null;
    const accDept = user?.acc_dept?._id ? toObjectId(user.acc_dept._id) : null;

    if (user?.acc_typ?.heirarchy === 3 && !accPlnt && !accDept) {
        return { apprvlDetails: [], isApprvr: false };
    }

    const matchCriteria = {
        'approvalDetails.approvers.approverAccount': toObjectId(user._id),
        status: 'Active'
    };

    if (user?.acc_typ?.heirarchy === 3) {
        matchCriteria['approvalCreatorBase'] = accPlnt;
        matchCriteria['approvalFunction'] = accDept;
    } else {
        if (accPlnt) matchCriteria['approvalCreatorBase'] = accPlnt;
    }

    const pipeline = [
        { $unwind: '$approvalDetails' },
        { $unwind: '$approvalDetails.approvers' },
        { $match: matchCriteria },

        {
            $project: {
                approvalCode: 1,
                approvalCreatorBase: 1,
                approvalFunction: 1,
                approvalLevel: '$approvalDetails.approvalLevel',
                approver: '$approvalDetails.approvers.approverAccount'
            }
        }
    ];

    const dynapprvlRecords = await dynapprvlModel.aggregate(pipeline);

    return {
        apprvlDetails: dynapprvlRecords,
        isApprvr: dynapprvlRecords.length > 0
    };
};


// CR
export const fetchComplianceDetails = async user => {
    if (user?.acc_typ?.heirarchy === 3 && !user?.acc_plnt && !user?.acc_dept) {
        return { success: false, message: 'Plant/Department missing' };
    }
    const accPlnt = user?.acc_plnt?._id ? toObjectId(user?.acc_plnt?._id) : null;
    const accDept = user?.acc_dept?._id ? toObjectId(user?.acc_dept?._id) : null;

    const approverInfo = await checkApprover(user);
    // console.log(approverInfo);

    const matchCriteria = {}
    if (user?.acc_typ?.heirarchy === 3) {
        matchCriteria['plant'] = accPlnt;
        matchCriteria['department'] = accDept;
    }
    else {
        if (accPlnt) matchCriteria['plant'] = accPlnt;
    }

    const approvalMap = (approverInfo?.apprvlDetails || []).map(a => ({
        plant: String(a.approvalCreatorBase?._id),
        department: String(a.approvalFunction?._id),
        approvalLevel: a.approvalLevel,
        acc_id: String(a.approvers?.approverAccount)
    }));

    const pipeline = [
        ...(Object.keys(matchCriteria).length ? [{ $match: matchCriteria }] : []),
        { $lookup: { from: 'plants', localField: 'plant', foreignField: '_id', as: 'plant' } },
        { $unwind: { path: '$plant', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' } },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'compliancetypes', localField: 'complianceType', foreignField: '_id', as: 'complianceType' } },
        { $unwind: { path: '$complianceType', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'compliancecategories', localField: 'complianceCategorization', foreignField: '_id', as: 'complianceCategorization' } },
        { $unwind: { path: '$complianceCategorization', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'compliancefrequencies', localField: 'complianceFrequency', foreignField: '_id', as: 'complianceFrequency' } },
        { $unwind: { path: '$complianceFrequency', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'criticalities', localField: 'criticality', foreignField: '_id', as: 'criticality' } },
        { $unwind: { path: '$criticality', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'penalties', localField: 'penaltyType', foreignField: '_id', as: 'penaltyType' } },
        { $unwind: { path: '$penaltyType', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
        { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
        { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },

        /* ✅ POPULATE FILES */
        { $lookup: { from: 'files', localField: 'allDocs', foreignField: '_id', as: 'allDocs' } },

        // { $addFields: { isApprover: approverInfo.length > 0 } },
        {
            $addFields: {
                approvalMatch: {
                    $first: {
                        $filter: {
                            input: approvalMap,
                            as: 'ap',
                            cond: {
                                $and: [
                                    { $eq: ['$$ap.plant', { $toString: '$plant._id' }] },
                                    { $eq: ['$$ap.department', { $toString: '$department._id' }] }
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                // plantName: '$plant.name',
                // departmentName: '$department.name',
                // complianceTypeName: '$complianceType.name',
                // complianceCategoryName: '$complianceCategorization.name',
                // complianceFrequencyName: '$complianceFrequency.name',
                // criticalityName: '$criticality.name',
                // penaltyName: '$penaltyType.name',
                // createdBy: '$createdby.acc_uname',
                // updatedBy: '$updatedby.acc_uname',
                approvalLevel: { $cond: [{ $and: [{ $ifNull: ['$approvalMatch.approvalLevel', false] }, { $eq: ['$currentPendingApprovalLevel', '$approvalMatch.approvalLevel'] }] }, '$approvalMatch.approvalLevel', 0] },
                isApprover: { $cond: [{ $and: [{ $ifNull: ['$approvalMatch.approvalLevel', false] }, { $eq: ['$currentPendingApprovalLevel', '$approvalMatch.approvalLevel'] }] }, true, false] },
                createdAtITC: { $dateToString: { format: '%d-%m-%Y %H:%M:%S', date: '$createdAt', timezone: '+05:30' } },
                updatedAtITC: { $dateToString: { format: '%d-%m-%Y %H:%M:%S', date: '$updatedAt', timezone: '+05:30' } }
            }
        },
        { $sort: { updatedAt: -1 } }
    ];

    const data = await complianceModel.aggregate(pipeline);
    return { success: true, data };
};

const generateId = async (user, dataList, currentData) => {
    let plntCode, deptCode
    if (user?.acc_plnt?.code) {
        plntCode = user?.acc_plnt?.code
    }
    else {
        const plntDetails = await plntModel.findById(currentData?.plantId)
        plntCode = plntDetails?.code
    }
    if (user?.acc_dept?.code) {
        deptCode = user?.acc_dept?.code
    }
    else {
        const deptDetails = await deptModel.findById(currentData?.departmentId)
        deptCode = deptDetails?.code
    }
    
    const maxHash = dataList.reduce((acc, elm) => {
        const hashData = parseInt(String(elm.complianceId).split("-")[0].split('CMP')[1], 10)
        
        if (hashData>acc) {
            acc=hashData
        }
        else {
            acc=acc
        }
        return acc
    }, 0)
    return (`CMP${parseInt(maxHash || 0)+1}-${plntCode}-${deptCode}`);
}

const calculateApproval = (user, maxLvl, currLvl, flag) => {
    const approved = flag !== 0;
    const next = currLvl + 1;

    return {
        status: approved && next <= maxLvl ? 'Pending' : approved ? 'Active' : 'Closed',
        approvalStatus: approved && next <= maxLvl ? `Pending L${next} Approval` : approved ? 'Approved' : 'Rejected',
        currentPendingApprovalLevel: approved && next <= maxLvl ? next : 0,
        approvalDetails: {
            approvalLevel: currLvl,
            approvalOption: approved ? 'Approval' : 'Rejection',
            approver: user._id,
            approvalDate: moment().format('DD-MM-YYYY'),
            approvalTime: moment().format('HH:mm:ss')
        }
    };
};

// const sendMailToApprover = async (plant, department, currentPendingApprovalLevel) => {
//     const approvals = await fetchApprovalDetails(String(plant?._id), String(department?._id), null);
//     const currentLevelApprovers = approvals?.approvalDetails
//     ?.find(ad => ad.approvalLevel === parseInt(currentPendingApprovalLevel, 10))
//     ?.approvers?.map(a => ({ ...a, approvalLevel: parseInt(currentPendingApprovalLevel, 10) })) || [];

//     // console.log(currentLevelApprovers);
//     if (currentLevelApprovers?.length === 0) return { success: false };
//     const recipients = currentLevelApprovers.map(a => a.approverAccount?.acc_eml && a.approverAccount?.acc_eml.trim()).filter(Boolean);
//     // console.log('Recipients:', recipients);
//     const mailResponse = await mailConfig(
//         recipients,
//         [],
//         [],
//         `Approval Required: Compliance Pending L${currentPendingApprovalLevel} Approval`,
//         `<p>Dear Approver,</p>
//         <p>A compliance record is pending your approval at Level ${currentPendingApprovalLevel}.</p>
//         <p>Please log in to the eCompliance system to review and take necessary action.</p>
//         <p>Regards,<br/>eCompliance System</p>`,
//         []
//     );
//     if (mailResponse?.response) return { success: true, message: 'Email sent successfully', data: mailResponse };
//     else return { success: false, message: 'Failed to send email' };
// }

/* ======================================================
   File helpers
====================================================== */

// const uploadFiles = async (files = [], userId) => {
//     const uploaded = [];
//     const duplicates = [];

//     await Promise.allSettled(
//         files.map(async f => {
//             try {
//                 const res = await uploadUniqueFile(f.buffer, f.originalname, f.mimetype);
//                 if (res?.file) {
//                     uploaded.push({
//                         filId: res.file._id,
//                         filName: res.file.filename,
//                         filContentType: res.file.metadata?.contentType,
//                         filContentSize: res.file.length,
//                         filUploadStatus: 'Done',
//                         fileUploadedby: userId
//                     });
//                 }
//             } catch (err) {
//                 if (err?.message?.includes('Duplicate')) duplicates.push(f.originalname);
//                 else console.error('Upload error:', err);
//             }
//         })
//     );

//     return { uploaded, duplicates };
// };

// const deleteFiles = async (ids = []) => {
//     await Promise.allSettled(
//         ids.map(id => deleteFile(id).catch(e => console.error('Delete error:', e)))
//     );
// };





/* ================================================================================================================
// ----------------------------------------------------------------------------------------------------------------
// CONTROLLERS-----------------------------------------------------------------------------------------------------

/* ======================================================
   CREATE
====================================================== */

export const create = async (req, res) => {
    try {
        const user = req.user;
        const compPayload = safeJSONParse(req.body);
        // console.log(compPayload);

        const ids = mapIds(compPayload);
        const plantId = ids.plant || user?.acc_plnt?._id;
        const departmentId = ids.department || user?.acc_dept?._id;

        const existingData = await fetchComplianceDetails(user);
        compPayload.complianceId = await generateId(user, existingData.data, { plantId, departmentId })

        const files = req.files?.allDocs || [];
        // console.log(files);

        const { uploaded } = await uploadFiles([].concat(files));
        // console.log(uploaded);

        const approvals = await fetchApprovalDetails(String(plantId), String(departmentId), user);
        // console.log(approvals);
        let hasApproval = true;
        if (!approvals) {
            hasApproval = false;
        }

        const compliance = await complianceModel.create({
            ...compPayload,
            ...ids,
            plant: plantId,
            department: departmentId,
            allDocs: uploaded,
            status: hasApproval ? 'Open' : 'Active',
            approvalStatus: hasApproval ? 'Pending L1 Approval' : 'Approved',
            currentPendingApprovalLevel: hasApproval ? 1 : 0,
            createdby: user?._id
        });
        if (!compliance) return res.status(400).json({ success: false, message: 'Failed to create compliance record' });

        // const mailRes = await sendMailToApprover(user, compliance.currentPendingApprovalLevel)
        // if (!mailRes.success) {
        //     console.error('Error sending mail to approver:', mailRes.message);
        //     res.status(201).json({ success: true, data: compliance, message: 'Compliance record created successfully' });
        // }
        // else {
        //     res.status(201).json({ success: true, data: compliance, message: 'Compliance record created successfully' });
        // }

        res.status(201).json({ success: true, data: compliance, message: 'Compliance record created successfully' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ======================================================
   READ
====================================================== */

export const read = async (req, res) => {
    try {
        const result = await fetchComplianceDetails(req.user);
        res.status(result.success ? 200 : 400).json({ message: result.message, success: result.success, data: result.data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   READ BY ID
====================================================== */

export const readById = async (req, res) => {
    try {
        if (!isValidObjectId(req.query.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const data = await complianceModel
            .findById(req.query.id)
            .populate(['plant', 'department', 'createdby', 'updatedby'])
            .lean();

        if (!data) return res.status(404).json({ message: 'Compliance record not found', success: false });

        res.status(200).json({ message: 'Compliance record retrieved successfully', success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   UPDATE
====================================================== */

export const update = async (req, res) => {
    try {
        const id = req.query.id;
        const user = req.user;
        const payload = safeJSONParse(req.body);
        console.log(payload);

        const ids = mapIds(payload);

        if (payload.removedDocs?.length) {
            await deleteFiles(payload.removedDocs);
            await complianceModel.findByIdAndUpdate(id, {
                $pull: { allDocs: { filId: { $in: payload.removedDocs } } }
            });
        }

        const files = req.files?.allDocs || [];
        const { uploaded } = await uploadFiles([].concat(files), payload.complianceId);

        // delete payload.complianceId

        const updated = await complianceModel.findByIdAndUpdate(
            id,
            { ...payload, ...ids, updatedby: user?._id, $push: { allDocs: { $each: uploaded } } },
            { new: true }
        );

        res.status(201).json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ======================================================
   APPROVE / REJECT
====================================================== */

export const approve = async (req, res) => {
    try {
        const id = req.query.id;
        const user = req.user;
        const flag = Number(req.query.flg || 1);
        const { plant, department, currentPendingApprovalLevel } = safeJSONParse(req.body);

        const approvals = await fetchApprovalDetails(String(plant?._id), String(department?._id), user);
        const result = calculateApproval(user, approvals?.approvalDetails?.length, currentPendingApprovalLevel, flag);

        const apprvData = await complianceModel.findByIdAndUpdate(
            id,
            {
                status: result.status,
                approvalStatus: result.approvalStatus,
                currentPendingApprovalLevel: result.currentPendingApprovalLevel,
                updatedby: user._id,
                $push: { approvalDetails: result.approvalDetails }
            },
            { new: true }
        );

        if (!apprvData) return res.status(404).json({ success: false, message: 'Compliance record not found' });

        // console.log(apprvData);
        // const mailRes = await sendMailToApprover(apprvData.plant, apprvData.department, apprvData.currentPendingApprovalLevel)
        // if (!mailRes.success) {
        //     console.error('Error sending mail to approver:', mailRes.message)
        //     res.status(201).json({ success: true, data: apprvData, message: `Compliance record ${flag === 1 ? 'approved' : 'rejected'} successfully` });
        // }
        // else {
        //     res.status(201).json({ success: true, data: apprvData, message: `Compliance record ${flag === 1 ? 'approved' : 'rejected'} successfully` });
        // }

        res.status(201).json({ success: true, data: apprvData, message: `Compliance record ${flag === 1 ? 'approved' : 'rejected'} successfully` })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ======================================================
   STATUS UPDATE
====================================================== */

export const statusUpdate = async (req, res) => {
    try {
        const data = await complianceModel.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, updatedby: req.user._id },
            { new: true }
        );
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   REMOVE
====================================================== */

export const remove = async (req, res) => {
    try {
        const compId = req.query.id;
        const rmvComp = await complianceModel.findByIdAndDelete(compId);

        res.status(200).json({ success: true, data: rmvComp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    create,
    read,
    readById,
    update,
    approve,
    statusUpdate,
    remove
};
