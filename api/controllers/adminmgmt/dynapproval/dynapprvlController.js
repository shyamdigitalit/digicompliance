import mongoose from "mongoose";
import dynapprvlModel from "../../../models/adminmgmt/dynapproval/dynapprvlModel.js";
import accModel from "../../../models/accModel.js";
import plantModel from "../../../models/masters/admin/plntModel.js";
import departmentModel from "../../../models/masters/accsetups/deptModel.js";
import { formatIST } from "../../../utilities/formatIST.js";

// Dynamic Denormalization Approach (Highest Level of Optimisation):
// In the create function, we are fetching the account details (username and fullname)
// for each approver and storing them directly in the Dynamic Approval document.
// This way, we avoid the need for complex population and aggregation when reading the Dynamic Approval records later.
// The fetchAccountDetails helper function is used to retrieve the necessary account information based on the approver's account ID.
// ------------------------------------------------------------------------------------------------------------------------------------------
// const fetchAccountDetails = async (accountId) => {
//     if (!mongoose.Types.ObjectId.isValid(accountId)) {
//         return null;
//     }
//     const account = await accModel.findById(accountId).select("acc_uname acc_fname").lean();
//     if (!account) {
//         return null;
//     }
//     return account;
// }
// const create = async (req, res) => {
//     try {
//         const dynapprvlPayld = req.body;
//         const user = req.user;

//         // console.log(dynapprvlPayld);
//         if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.approvalCreatorBase?._id)) {
//             dynapprvlPayld.approvalCreatorBaseId = new mongoose.Types.ObjectId(dynapprvlPayld.approvalCreatorBase?._id)
//             dynapprvlPayld.plantCode = dynapprvlPayld.approvalCreatorBase?.code || "";
//             dynapprvlPayld.plantName = dynapprvlPayld.approvalCreatorBase?.name || "";
//         }
//         if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.approvalFunction?._id)) {
//             dynapprvlPayld.approvalFunctionId = new mongoose.Types.ObjectId(dynapprvlPayld.approvalFunction?._id)
//             dynapprvlPayld.departmentCode = dynapprvlPayld.approvalFunction?.code || "";
//             dynapprvlPayld.departmentName = dynapprvlPayld.approvalFunction?.name || "";
//         }
//         const approvalDetails = await Promise.all(dynapprvlPayld.approvalDetails?.filter(elm => elm?.approvers?.length > 0)?.map(async (elm, i) => ({
//             approvalLevel: i+1,
//             approvalTitle: elm?.approvalTitle || "",
//             approvalTag: elm?.approvalTag || "",
//             approvers: await Promise.all(elm?.approvers?.map(async (apprv) => ({
//                 approverAccount: {
//                     approverId: mongoose.Types.ObjectId.isValid(apprv?.approverAccount) ? new mongoose.Types.ObjectId(apprv?.approverAccount) : null,
//                     approverUsername: (await fetchAccountDetails(apprv?.approverAccount))?.acc_uname || "",
//                     approverFullname: (await fetchAccountDetails(apprv?.approverAccount))?.acc_fname || "",
//                 },
//                 approverAbbreviation: apprv?.approverAbbreviation || "",
//                 approverRole: apprv?.approverRole || ""
//             }))) || []
//         })) || [])
        
//         Object.assign(dynapprvlPayld, {
//             approvalDetails: approvalDetails,
//             status: approvalDetails.length > 0 ? "Active" : "Inactive",
//             createdById: user?._id,
//             createdByName: user?.acc_fname || ""
//         })

//         const dynapprvl = await dynapprvlModel.create(await dynapprvlPayld);
//         if (!dynapprvl) {
//             return res.status(404).json({ message: "Failed to create Dynamic Approval record" });
//         } else {
//             res.status(201).json({ message: "Dynamic Approval record created successfully", data: dynapprvl });
//         }
//     } catch (error) {
//         console.error(error)
//     }
// }

// ==========================================================================================================================
// Normalized Approach (Less Optimized, More Flexible):
const create = async (req, res) => {
    try {
        const dynapprvlPayld = req.body;
        const user = req.user;

        // console.log(dynapprvlPayld);
        
        if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.approvalCreatorBase?._id)) {
            dynapprvlPayld.approvalCreatorBase = new mongoose.Types.ObjectId(dynapprvlPayld.approvalCreatorBase?._id)
        }        
        if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.approvalFunction?._id)) {
            dynapprvlPayld.approvalFunction = new mongoose.Types.ObjectId(dynapprvlPayld.approvalFunction?._id)
        }
        // console.log(dynapprvlPayld);
        const existingDynapprvl = await dynapprvlModel.findOne({
            approvalCreatorBase: dynapprvlPayld.approvalCreatorBase,
            approvalFunction: dynapprvlPayld.approvalFunction
        }).lean();

        // console.log(dynapprvlPayld);

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

// ==========================================================================================================================
// Read function with optimized aggregation pipeline to handle the denormalized structure efficiently
// export const fetchApprovalDetails = async (cBase, funcId) => {
//     const filter = {};

//     if (cBase) {
//         filter.$or = [
//             { approvalCreatorBaseId: cBase },
//             { plantCode: new RegExp(`^${cBase}$`, "i") }
//         ];
//     }

//     if (funcId) {
//         filter.$and = [
//             {
//                 $or: [
//                     { approvalFunctionId: funcId },
//                     { departmentCode: new RegExp(`^${funcId}$`, "i") }
//                 ]
//             }
//         ];
//     }

//     // console.log(filter);

//     const data = await dynapprvlModel.findOne().sort({ updatedAt: -1 }).lean();
//     // console.log(data);
//     return data;
// };

// ==========================================================================================================================
// Normalized Approach with population and aggregation (Less Optimized, More Flexible):
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
    const accTyp = parseInt(user?.acc_typ?.heirarchy || 0);

    const filter = {};

    /**
     * -----------------------------------
     * Resolve approvalCreatorBase
     * -----------------------------------
     */
    if (cBase || accTyp > 2) {
        if (mongoose.Types.ObjectId.isValid(cBase)) {
            filter.approvalCreatorBase = cBase;
        } else if (cBase) {
            const plant = await plantModel
                .findOne(
                    { plantCode: new RegExp(`^${cBase}$`, "i") },
                    { _id: 1 }
                )
                .lean();

            if (!plant) return null;

            filter.approvalCreatorBase = plant._id;
        }
    }

    /**
     * -----------------------------------
     * Resolve approvalFunction
     * -----------------------------------
     */
    if (funcId || accTyp > 2) {
        if (mongoose.Types.ObjectId.isValid(funcId)) {
            filter.approvalFunction = funcId;
        } else if (funcId) {
            const dept = await departmentModel
                .findOne(
                    { departmentCode: new RegExp(`^${funcId}$`, "i") },
                    { _id: 1 }
                )
                .lean();

            if (!dept) return null;

            filter.approvalFunction = dept._id;
        }
    }

    /**
     * -----------------------------------
     * Main Query
     * -----------------------------------
     */
    const record = await dynapprvlModel
        .findOne(filter)
        .sort({ updatedAt: -1 })
        .populate("approvalCreatorBase", "code name")
        .populate("approvalFunction", "code name")
        .populate("createdby", "acc_uname acc_fname")
        .populate("updatedby", "acc_uname acc_fname")
        .populate({
            path: "approvalDetails.approvers.approverAccount",
            select: "acc_uname acc_fname"
        })
        .lean();

    if (!record) return null;

    /**
     * -----------------------------------
     * Sort approvalDetails + approvers
     * -----------------------------------
     */
    if (Array.isArray(record.approvalDetails)) {
        record.approvalDetails.sort(
            (a, b) => a.approvalLevel - b.approvalLevel
        );

        record.approvalDetails.forEach((item) => {
            if (Array.isArray(item.approvers)) {
                item.approvers.sort((a, b) =>
                    String(a._id).localeCompare(String(b._id))
                );
            }
        });
    }
    record.createdAtITC = formatIST(record.createdAt);
    record.updatedAtITC = formatIST(record.updatedAt);

    return record;
};


const read = async (req, res) => {
    try {
        const cBase = String(req.query.cbase || '').trim();
        const funcId = String(req.query.fnid || '').trim();
        const user = req.user || null

        const records = await fetchApprovalDetails(cBase, funcId)
        // const records = await dynapprvlModel.find().sort({ updatedAt: -1 }).lean();
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
        }},
        { $sort: { updatedAt: -1 }}
    ];

    const accounts = await accModel.aggregate(pipeline);
    return accounts;
}

// export const fetchAvailableAccounts = async (cBase, funcId) => {
//     const matchStage = {
//         $match: {
//             $or: [
//                 // ✅ Case 1: hierarchy >= 2 with plant/department condition
//                 {
//                     $and: [
//                     { "acc_typ.heirarchy": { $gt: 2 } },

//                     ...(cBase
//                         ? [
//                             mongoose.Types.ObjectId.isValid(cBase)
//                             ? { "acc_plnt._id": new mongoose.Types.ObjectId(cBase) }
//                             : { "acc_plnt.code": { $regex: `^${cBase}$`, $options: "i" } }
//                         ]
//                         : []),

//                     ...(funcId
//                         ? [
//                             {
//                             $or: [
//                                 mongoose.Types.ObjectId.isValid(funcId)
//                                 ? { "acc_dept._id": new mongoose.Types.ObjectId(funcId) }
//                                 : { "acc_dept.code": { $regex: `^${funcId}$`, $options: "i" } },
//                                 { acc_dept: null }, // ✅ allow plant-only mapping
//                             ]
//                             }
//                         ]
//                         : [])
//                     ]
//                 },

//                 // ✅ Case 2: hierarchy < 2 (no restriction)
//                 {
//                     "acc_typ.heirarchy": { $lte: 2 }
//                 }
//             ]
//         }
//     };
//     const query = matchStage.$match ? { $and: [ matchStage.$match ] } : {};

//     const accounts = accModel.find(query)
//         .select("_id acc_fname acc_typ acc_plnt acc_dept")
//         .lean();
//     return accounts;
// }

// export const fetchAvailableAccounts = async (cBase, funcId) => {
//     // 1. Pre-process IDs to avoid validation overhead inside the query
//     const isCBaseId = mongoose.Types.ObjectId.isValid(cBase);
//     const isFuncId = mongoose.Types.ObjectId.isValid(funcId);

//     // 2. Define the main query
//     // Note: Filtering on populated fields (like acc_typ.heirarchy) 
//     // requires a two-step process or keeping the logic in the match.
//     const query = {
//         $or: [
//         { "acc_typ.heirarchy": { $lte: 2 } }, // This only works if denormalized
//         {
//             $and: [
//             // Filter by plant ID directly if it's an ObjectId
//             ...(cBase && isCBaseId ? [{ acc_plnt: new mongoose.Types.ObjectId(cBase) }] : []),
//             // For code-based filtering or hierarchy, we usually use populate match
//             ]
//         }
//         ]
//     };

//     const accounts = await accModel.find(query).populate({
//             path: 'acc_typ',
//             match: {}, // You can add filters here, but it won't hide the parent Account
//         }).populate({
//             path: 'acc_plnt',
//             match: !isCBaseId && cBase ? { code: new RegExp(`^${cBase}$`, 'i') } : {}
//         }).populate({
//             path: 'acc_dept',
//             match: !isFuncId && funcId ? { code: new RegExp(`^${funcId}$`, 'i') } : {}
//         }).populate('acc_desig createdby updatedby').lean(); // Returns plain JS objects for better performance

//     // 3. Post-query filtering (Required for .find() if filtering by populated fields)
//     return accounts.filter(acc => {
//         const hierarchy = acc.acc_typ?.heirarchy;
        
//         // Case 1: Hierarchy < 2
//         if (hierarchy <= 2) return true;

//         // Case 2: Hierarchy > 2 (Must match plant/dept)
//         const plantMatch = !cBase || (isCBaseId ? String(acc.acc_plnt?._id) === cBase : acc.acc_plnt?.code?.toLowerCase() === cBase.toLowerCase());
//         const deptMatch = !funcId || (isFuncId ? String(acc.acc_dept?._id) === funcId : acc.acc_dept?.code?.toLowerCase() === funcId.toLowerCase()) || acc.acc_dept === null;

//         return hierarchy > 2 && plantMatch && deptMatch;
//     }).map(acc => ({
//         ...acc,
//         createdAtITC: acc.createdAt?.toLocaleString("en-GB", { timeZone: "+05:30" }),
//         updatedAtITC: acc.updatedAt?.toLocaleString("en-GB", { timeZone: "+05:30" })
//     }));
// };
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