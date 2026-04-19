import mongoose from "mongoose";
import dynapprvlModel from "../../../models/adminmgmt/dynapproval/dynapprvlModel.js";

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
        });

        dynapprvlPayld.approvalDetails = dynapprvlPayld.approvalDetails?.filter(elm => elm?.approvers?.length > 0)?.map((elm, i) => ({
            approvalLevel: i+1,
            approvalTitle: elm?.approvalTitle || "",
            approvalTag: elm?.approvalTag || "",
            approvers: elm?.approvers
        }))
        // console.log(dynapprvlPayld.approvalDetails);
        if (!existingDynapprvl) {
            if (dynapprvlPayld.approvalDetails?.length === 0) return res.status(404).json({ message: "No Approver selected yet !" });
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
                const deletedDynapprvl = await dynapprvlModel.findByIdAndDelete(existingDynapprvl._id);
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
                const updatedDynapprvl = await dynapprvlModel.findOneAndUpdate({ _id: existingDynapprvl._id }, dynapprvlPayld, { new: true });
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

export const fetchApprovalDetails = async (cBase, funcId, user) => {
    // console.log(funcId);
    const accTyp = parseInt(user?.acc_typ?.heirarchy || 0)
    // console.log(accTyp);

    const matchFunc = {};
    if (cBase || accTyp>2) {
        if (mongoose.Types.ObjectId.isValid(cBase)) {
            matchFunc['approvalCreatorBase._id'] = new mongoose.Types.ObjectId(cBase);
        } else {
            matchFunc['approvalCreatorBase.plantCode'] = { $regex: `^${cBase}$`, $options: 'i' };
        }
    }
    if (funcId || accTyp>2) {
        if (mongoose.Types.ObjectId.isValid(funcId)) {
            matchFunc['approvalFunction._id'] = new mongoose.Types.ObjectId(funcId);
        } else {
            matchFunc['approvalFunction.departmentCode'] = { $regex: `^${funcId}$`, $options: 'i' };
        }
    }

    const pipeline = [
        // Populate approvalFunction (Function)
        { $lookup: { from: 'plants', localField: 'approvalCreatorBase', foreignField: '_id', as: 'approvalCreatorBase' } },
        { $unwind: '$approvalCreatorBase' },
        { $lookup: { from: 'departments', localField: 'approvalFunction', foreignField: '_id', as: 'approvalFunction' } },
        { $unwind: '$approvalFunction' },

        // ✅ Dynamic filter by funcId (either ObjectId or departmentCode)
        ...(Object.keys(matchFunc).length ? [{ $match: matchFunc }] : []),

        // Populate createdby
        { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
        { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },

        // Populate updatedby
        { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
        { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },

        // Step 1: Unwind approvalDetails
        {
            $unwind: { path: '$approvalDetails', preserveNullAndEmptyArrays: true } },
        // Step 2: Lookup all approvers accounts
        { $lookup: { from: 'accounts', localField: 'approvalDetails.approvers.approverAccount', foreignField: '_id', as: 'approvalDetails.approvers.approverAccount' } },
        {
            $addFields: {
                createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
            }
        },

        // Step 3: Group back approvalDetails into array
        {
            $group: {
                _id: '$_id',
                doc: { $first: '$$ROOT' },
                approvalDetails: {
                    $push: {
                        approvalLevel: '$approvalDetails.approvalLevel',
                        approvalTitle: '$approvalDetails.approvalTitle',
                        approvalTag: '$approvalDetails.approvalTag',
                        approvers: {
                            approverAccount: '$approvalDetails.approvers.approverAccount',
                            approverRole: '$approvalDetails.approvers.approverRole',
                            approverAbbreviation: '$approvalDetails.approvers.approverAbbreviation'
                        }
                    }
                }
            }
        },
        { $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { approvalDetails: '$approvalDetails' }] } } },
        { $sort: { updatedAt: -1 } }
    ]
    const dynapprvlRecords = await dynapprvlModel.aggregate(pipeline)
    return dynapprvlRecords
}

const read = async (req, res) => {
    try {
        const cBase = String(req.query.cbase || '').trim();
        const funcId = String(req.query.fnid || '').trim();
        const user = req.user || null

        const records = await fetchApprovalDetails(cBase, funcId, user)

        res.status(200).json({
            message: 'Dynamic Approval records retrieved successfully',
            data: records,
        });
    } catch (error) {
        console.error('Error retrieving Dynamic Approval records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const readById = async (req, res) => {
    try {
        const dynapprvlId = req.params.id;
        const dynapprvlRecord = await dynapprvlModel.findById(dynapprvlId)
            .populate(['approvalCreatorBase', 'approvalFunction', { path: 'approvalDetails', populate: 'approvers'}, 'createdby', 'updatedby']);
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
    readById
};