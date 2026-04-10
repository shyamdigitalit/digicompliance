import compcategModel from '../../../models/masters/complncsetups/compcategModel.js';

const create = async (req, res) => {
    try {
        const compcategPayld = req.body;
        const user = req.user;

        Object.assign(compcategPayld, { status: 'Active', createdby: user._id });
        const existingCompcateg = await compcategModel.findOne({ code: compcategPayld.code });
        if (existingCompcateg) {
            return res.status(409).json({ message: "Compliance Category code already exists", statuscode: 409 });
        } else {
            const compcateg = await compcategModel.create(compcategPayld);
            if (!compcateg) {
                return res.status(401).json({ message: "Failed to create Compliance Category record" });
            } else {
                res.status(201).json({
                    message: "Compliance Category record created successfully",
                    statuscode: 201,
                    data: compcateg
                });
            }
        }
    } catch (error) {
        console.error("Error creating Compliance Category record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const read = async (req, res) => {
    try {
        const pipeline = [
            { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
            { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },
            { $addFields: {
                createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
            }},
            { $sort: { updatedAt: -1 } }
        ]
        const compcategRecords = await compcategModel.aggregate(pipeline)
        res.status(200).json({
            message: "Compliance Category records fetched successfully",
            statuscode: 200,
            data: compcategRecords
        });
    } catch (error) {
        console.error("Error fetching Compliance Category records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const compcategId = req.params.id;
        const compcategRecord = await compcategModel.findById(compcategId).populate(['createdby', 'updatedby']);
        if (!compcategRecord) {
            return res.status(404).json({ message: "Compliance Category record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Category record fetched successfully",
            statuscode: 200,
            data: compcategRecord
        });
    } catch (error) {
        console.error("Error fetching Compliance Category record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const compcategId = req.query.id;
        const compcategPayld = req.body;
        const user = req.user;

        Object.assign(compcategPayld, { status: 'Active', updatedby: user._id });
        const updatedCompcateg = await compcategModel.findByIdAndUpdate(compcategId, compcategPayld, { new: true });
        if (!updatedCompcateg) {
            return res.status(404).json({ message: "Compliance Category record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Category record updated successfully",
            statuscode: 200,
            data: updatedCompcateg
        });
    } catch (error) {
        console.error("Error updating Compliance Category record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const compcategId = req.query.id;
        const deletedCompcateg = await compcategModel.findByIdAndDelete(compcategId);
        if (!deletedCompcateg) {
            return res.status(404).json({ message: "Compliance Category record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Category record deleted successfully",
            statuscode: 200,
            data: deletedCompcateg
        });
    } catch (error) {
        console.error("Error deleting Compliance Category record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    create,
    read,
    readById,
    update,
    remove
};