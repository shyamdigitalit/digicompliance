import mongoose from "mongoose";
import dynapprvlModel from "../../../models/adminmgmt/dynapproval/dynapprvlModel.js";

const create = async (req, res) => {
    try {
        const dynapprvlPayld = req.body;
        const user = req.user;
        
        if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.apprvl_creator_base)) {
            dynapprvlPayld.apprvl_creator_base = new mongoose.Types.ObjectId(dynapprvlPayld.apprvl_creator_base)
        }        
        if (mongoose.Types.ObjectId.isValid(dynapprvlPayld.apprvl_func)) {
            dynapprvlPayld.apprvl_func = new mongoose.Types.ObjectId(dynapprvlPayld.apprvl_func)
        }
        // console.log(dynapprvlPayld);
        const existingDynapprvl = await dynapprvlModel.findOne({
            apprvl_creator_base: dynapprvlPayld.apprvl_creator_base,
            apprvl_func: dynapprvlPayld.apprvl_func
        });

        dynapprvlPayld.apprvr_dtl = dynapprvlPayld.apprvr_dtl?.filter(elm => elm?.apprvr?.length > 0)?.map((elm, i) => ({
            apprvl_lvl: i+1, apprvr: elm?.apprvr
        }))
        // console.log(dynapprvlPayld.apprvr_dtl);
        if (!existingDynapprvl) {
            if (dynapprvlPayld.apprvr_dtl?.length === 0) return res.status(404).json({ message: "No Approver selected yet !" });
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
            if (dynapprvlPayld.apprvr_dtl?.length === 0) {
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
                delete dynapprvlPayld?.apprvl_code
                delete dynapprvlPayld?.apprvl_creator_base
                delete dynapprvlPayld?.apprvl_func
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
    try {
        // console.log(funcId);
        const accTyp = parseInt(user?.acc_typ?.heirarchy || 0)
        // console.log(accTyp);

        const matchFunc = {};
        if (cBase || accTyp>2) {
            if (mongoose.Types.ObjectId.isValid(cBase)) {
                matchFunc['apprvl_creator_base._id'] = new mongoose.Types.ObjectId(cBase);
            } else {
                matchFunc['apprvl_creator_base.plantCode'] = { $regex: `^${cBase}$`, $options: 'i' };
            }
        }
        if (funcId || accTyp>2) {
            if (mongoose.Types.ObjectId.isValid(funcId)) {
                matchFunc['apprvl_func._id'] = new mongoose.Types.ObjectId(funcId);
            } else {
                matchFunc['apprvl_func.departmentCode'] = { $regex: `^${funcId}$`, $options: 'i' };
            }
        }

        const pipeline = [
            // Populate apprvl_func (Function)
            { $lookup: { from: 'plants', localField: 'apprvl_creator_base', foreignField: '_id', as: 'apprvl_creator_base' } },
            { $unwind: '$apprvl_creator_base' },
            { $lookup: { from: 'departments', localField: 'apprvl_func', foreignField: '_id', as: 'apprvl_func' } },
            { $unwind: '$apprvl_func' },

            // ✅ Dynamic filter by funcId (either ObjectId or departmentCode)
            ...(Object.keys(matchFunc).length ? [{ $match: matchFunc }] : []),

            // Populate createdby
            { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
            { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },

            // Populate updatedby
            { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },

            // Step 1: Unwind apprvr_dtl
            {
                $unwind: { path: '$apprvr_dtl', preserveNullAndEmptyArrays: true } },
            // Step 2: Lookup all apprvr accounts
            { $lookup: { from: 'accounts', localField: 'apprvr_dtl.apprvr', foreignField: '_id', as: 'apprvr_dtl.apprvr' } },
            {
                $addFields: {
                    createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                    updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
                }
            },

            // Step 3: Group back apprvr_dtl into array
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    apprvr_dtl: {
                        $push: {
                            apprvl_lvl: '$apprvr_dtl.apprvl_lvl',
                            apprvr: '$apprvr_dtl.apprvr'
                        }
                    }
                }
            },
            { $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { apprvr_dtl: '$apprvr_dtl' }] } } },
            { $sort: { updatedAt: -1 } }
        ]
        const dynapprvlRecords = await dynapprvlModel.aggregate(pipeline)
        return dynapprvlRecords
    } catch (error) {
        console.error('Error retrieving Dynamic Approval records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
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
            .populate(['apprvl_creator_base', 'apprvl_func', { path: 'apprvr_dtl', populate: 'apprvr'}, 'createdby', 'updatedby']);
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