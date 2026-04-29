import mongoose from "mongoose";
import dynapprvlModel from "../../../models/adminmgmt/dynapproval/dynapprvlModel.js";
import accModel from "../../../models/accModel.js";

const create = async (req, res) => {
    try {
        const dynapprvlPayld = req.body;
        const user = req.user;
        
        if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.approvalCreatorBase)) {
            dynapprvlPayld.approvalCreatorBase = new mongoose.Types.ObjectId(dynapprvlPayld.approvalCreatorBase)
        }        
        if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.approvalFunction)) {
            dynapprvlPayld.approvalFunction = new mongoose.Types.ObjectId(dynapprvlPayld.approvalFunction)
        }
        // console.log(dynapprvlPayld);
        const existingDynapprvl = await dynapprvlModel.findOne({
            approvalCreatorBase: dynapprvlPayld.approvalCreatorBase,
            approvalFunction: dynapprvlPayld.approvalFunction
        }).lean();

        dynapprvlPayld.approvalDetails = dynapprvlPayld.approvalDetails?.filter(elm => elm?.approvers?.length > 0)?.map((elm, i) => ({
            approvalLevel: i+1,
            approvalTitle: elm?.approvalTitle || "",
            approvalTag: elm?.approvalTag || "",
            approvers: elm?.approvers
        }))
        // console.log(dynapprvlPayld.approvalDetails);
        if (!existingDynapprvl) {
            if (dynapprvlPayld.approvalDetails?.length === 0) {
                res.status(404).json({ message: "No Approver selected yet !" });
            }
            else {
                dynapprvlPayld.createdby = user?._id;
                const dynapprvl = await dynapprvlModel.create(dynapprvlPayld);
                if (!dynapprvl) {
                    return res.status(404).json({ message: "Failed to create Dynamic Approval record" });
                } else {
                    res.status(201).json({
                        message: "Dynamic Approval record created successfully",
                        data: dynapprvl,
                    });
                }
            }
        }
        else {
            if (dynapprvlPayld.approvalDetails?.length === 0) {
                const deletedDynapprvl = await dynapprvlModel.findByIdAndDelete(existingDynapprvl._id).lean();
                if (!deletedDynapprvl) {
                    return res.status(404).json({ message: "Failed to remove existing Dynamic Approval record" });
                }
                res.status(201).json({
                    message: "Existing dynamic Approval record removed successfully",
                    data: deletedDynapprvl,
                });
            }
            else {
                delete dynapprvlPayld?.approvalCode
                delete dynapprvlPayld?.approvalCreatorBase
                delete dynapprvlPayld?.approvalFunction
                dynapprvlPayld.updatedby = user?._id
                const updatedDynapprvl = await dynapprvlModel.findOneAndUpdate({ _id: existingDynapprvl._id }, dynapprvlPayld, { new: true }).lean();
                if (!updatedDynapprvl) {
                    return res.status(404).json({ message: "Failed to update existing Dynamic Approval record" });
                }
                res.status(201).json({
                    message: "Existing Dynamic Approval record updated successfully",
                    data: updatedDynapprvl,
                });
            }
        }
    } catch (error) {
        console.error("Error creating Dynamic Approval record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// export const fetchApprovalDetails = async (cBase, funcId, user) => {
//     // console.log(funcId);
//     const accTyp = parseInt(user?.acc_typ?.heirarchy || 0)
//     // console.log(accTyp);

//     const matchFunc = {};
//     if (cBase || accTyp>2) {
//         if (mongoose.Types.ObjectId.isValid(cBase)) {
//             matchFunc['approvalCreatorBase._id'] = new mongoose.Types.ObjectId(cBase);
//         } else {
//             matchFunc['approvalCreatorBase.plantCode'] = { $regex: `^${cBase}$`, $options: 'i' };
//         }
//     }
//     if (funcId || accTyp>2) {
//         if (mongoose.Types.ObjectId.isValid(funcId)) {
//             matchFunc['approvalFunction._id'] = new mongoose.Types.ObjectId(funcId);
//         } else {
//             matchFunc['approvalFunction.departmentCode'] = { $regex: `^${funcId}$`, $options: 'i' };
//         }
//     }

//     const pipeline = [
//         // Populate plant
//         { $lookup: { from: 'plants', localField: 'approvalCreatorBase', foreignField: '_id', as: 'approvalCreatorBase' } },
//         { $unwind: '$approvalCreatorBase' },

//         // Populate department
//         { $lookup: { from: 'departments', localField: 'approvalFunction', foreignField: '_id', as: 'approvalFunction' } },
//         { $unwind: '$approvalFunction' },

//         // Dynamic filter
//         ...(Object.keys(matchFunc).length ? [{ $match: matchFunc }] : []),

//         // createdby
//         { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
//         { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },

//         // updatedby
//         { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
//         { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },

//         // approvalDetails unwind
//         { $unwind: { path: "$approvalDetails", preserveNullAndEmptyArrays: true } },

//         // approvers unwind
//         { $unwind: { path: "$approvalDetails.approvers", preserveNullAndEmptyArrays: true } },

//         // Populate approver account
//         { $lookup: { from: "accounts", localField: "approvalDetails.approvers.approverAccount", foreignField: "_id", as: "approvalDetails.approvers.approverAccount" } },

//         // Convert approverAccount array to object
//         {
//             $addFields: {
//                 "approvalDetails.approvers.approverAccount": { $arrayElemAt: [ "$approvalDetails.approvers.approverAccount", 0 ] }
//             }
//         },

//         // Group approvers back per approval step
//         {
//             $group: {
//                 _id: {
//                     rootId: "$_id",
//                     approvalDetailsId: "$approvalDetails._id",
//                 },
//                 root: { $first: "$$ROOT" },
//                 approvers: { $push: "$approvalDetails.approvers" },
//             }
//         },

//         // Rebuild approvalDetails
//         {
//             $group: {
//                 _id: "$_id.rootId",
//                 root: { $first: "$root" },
//                 approvalDetails: {
//                     $push: {
//                         _id: "$_id.approvalDetailsId",
//                         approvalLevel: "$root.approvalDetails.approvalLevel",
//                         approvalTitle: "$root.approvalDetails.approvalTitle",
//                         approvalTag: "$root.approvalDetails.approvalTag",
//                         approvers: "$approvers",
//                     },
//                 },
//             },
//         },

//         // FINAL PERMANENT SORT (approvalDetails array)
//         {
//             $addFields: {
//                 approvalDetails: {
//                     $map: {
//                         input: {
//                             $sortArray: {
//                                 input: "$approvalDetails",
//                                 sortBy: { approvalLevel: 1 },
//                             },
//                         },
//                         as: "item",
//                         in: {
//                             $mergeObjects: [
//                                 "$$item",
//                                 {
//                                     approvers: {
//                                         $sortArray: {
//                                             input: "$$item.approvers",
//                                             sortBy: { _id: 1 },
//                                         },
//                                     },
//                                 },
//                             ],
//                         },
//                     },
//                 },
//             },
//         },

//         // Merge root back
//         { $replaceRoot: { newRoot: { $mergeObjects: [ "$root", { approvalDetails: "$approvalDetails" } ] } } },

//         // Optional IST fields
//         {
//             $addFields: {
//                 createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
//                 updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
//             }
//         },

//         { $sort: { updatedAt: -1 } }
//     ];
//     const dynapprvlRecords = await dynapprvlModel.aggregate(pipeline)
//     return dynapprvlRecords[0]
// }
export const fetchApprovalDetails = async (cBase, funcId, user) => {
    const dynapprvlRecords = await dynapprvlModel.findOne({ approvalCreatorBase:cBase, approvalFunction:funcId })
    .populate("approvalCreatorBase")
    .populate("approvalFunction")
    .populate("createdby")
    .populate("updatedby")
    .populate("approvalDetails.approvers.approverAccount")
    .lean();
    return dynapprvlRecords

    // const dynapprvlRecords = await dynapprvlModel.findOne({ approvalCreatorBase:cBase, approvalFunction:funcId })
    // .populate("approvalCreatorBase", "name code")
    // .populate("approvalFunction", "name code")
    // .populate("createdby", "acc_fname")
    // .populate("updatedby", "acc_fname")
    // .populate("approvalDetails.approvers.approverAccount","acc_fname")
    // .lean();
    // return dynapprvlRecords
}
const read = async (req, res) => {
    try {
        const cBase = String(req.query.cbase || '').trim();
        const funcId = String(req.query.fnid || '').trim();
        const user = req.user || null

        const records = await fetchApprovalDetails(cBase, funcId, user)
        // console.log(records);

        res.status(200).json({
            message: 'Dynamic Approval records retrieved successfully',
            data: records,
        });
    } catch (error) {
        console.error('Error retrieving Dynamic Approval records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const fetchAvailableAccounts = async (cBase, funcId) => {
    const matchStage = {
        $match: {
            $or: [
                // ✅ Case 1: hierarchy >= 2 with plant/department condition
                {
                    $and: [
                    { "acc_typ.heirarchy": { $gt: 2 } },

                    ...(cBase
                        ? [
                            mongoose.Types.ObjectId.isValid(cBase)
                            ? { "acc_plnt._id": new mongoose.Types.ObjectId(cBase) }
                            : { "acc_plnt.code": { $regex: `^${cBase}$`, $options: "i" } }
                        ]
                        : []),

                    ...(funcId
                        ? [
                            {
                            $or: [
                                mongoose.Types.ObjectId.isValid(funcId)
                                ? { "acc_dept._id": new mongoose.Types.ObjectId(funcId) }
                                : { "acc_dept.code": { $regex: `^${funcId}$`, $options: "i" } },
                                { acc_dept: null }, // ✅ allow plant-only mapping
                            ]
                            }
                        ]
                        : [])
                    ]
                },

                // ✅ Case 2: hierarchy < 2 (no restriction)
                {
                    "acc_typ.heirarchy": { $lte: 2 }
                }
            ]
        }
    };

    const pipeline = [
        { $lookup: { from: 'accounttypes', localField: 'acc_typ', foreignField: '_id', as: 'acc_typ' } },
        { $unwind: { path: '$acc_typ', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'plants', localField: 'acc_plnt', foreignField: '_id', as: 'acc_plnt' } },
        { $unwind: { path: '$acc_plnt', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'departments', localField: 'acc_dept', foreignField: '_id', as: 'acc_dept' } },
        { $unwind: { path: '$acc_dept', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'designations', localField: 'acc_desig', foreignField: '_id', as: 'acc_desig' } },
        { $unwind: { path: '$acc_desig', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
        { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
        { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },

        // Dynamic filter
        matchStage,

        { $addFields: {
            createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
            updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
        }}
    ];

    const accounts = await accModel.aggregate(pipeline);
    return accounts;
}
const filterAccounts = async (req, res) => {
    try {
        const cBase = String(req.query.cbase || '').trim();
        const funcId = String(req.query.fnid || '').trim();
        const accounts = await fetchAvailableAccounts(cBase, funcId);
        res.status(200).json({
            message: 'Accounts retrieved successfully',
            data: accounts,
        });
    }
    catch (error) {
        console.error('Error retrieving accounts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const readById = async (req, res) => {
    try {
        const dynapprvlId = req.params.id;
        const dynapprvlRecord = await dynapprvlModel.findById(dynapprvlId)
            .populate(['approvalCreatorBase', 'approvalFunction', { path: 'approvalDetails', populate: 'approvers'}, 'createdby', 'updatedby']).lean();
        if (!dynapprvlRecord) {
            return res.status(404).json({ message: "Dynamic Approval record not found" });
        }
        res.status(200).json({
            message: "Dynamic Approval record retrieved successfully",
            data: dynapprvlRecord,
        });
    } catch (error) {
        console.error("Error retrieving Dynamic Approval record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    create,
    read,
    filterAccounts,
    readById
};