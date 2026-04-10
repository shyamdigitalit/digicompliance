import penltyModel from "../../../models/masters/complncsetups/penltyModel.js";

const create = async (req, res) => {
    try {
        const penltyPayld = req.body;
        const user = req.user;

        Object.assign(penltyPayld, { status: 'Active', createdby: user._id });
        const existingPenlty = await penltyModel.findOne({ code: penltyPayld.code });
        if (existingPenlty) {
            return res.status(409).json({ message: "Penalty code already exists", statuscode: 409 });
        } else {
            const penlty = await penltyModel.create(penltyPayld);
            if (!penlty) {
                return res.status(401).json({ message: "Failed to create Penalty record" });
            } else {
                res.status(201).json({
                    message: "Penalty record created successfully",
                    statuscode: 201,
                    data: penlty
                });
            }
        }
    } catch (error) {
        console.error("Error creating Penalty record:", error);
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
        const penltyRecords = await penltyModel.aggregate(pipeline)
        res.status(200).json({
            message: "Penalty records fetched successfully",
            statuscode: 200,
            data: penltyRecords
        });
    } catch (error) {
        console.error("Error fetching Penalty records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const penltyId = req.params.id;
        const penltyRecord = await penltyModel.findById(penltyId).populate(['createdby', 'updatedby']);
        if (!penltyRecord) {
            return res.status(404).json({ message: "Penalty record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Penalty record fetched successfully",
            statuscode: 200,
            data: penltyRecord
        });
    } catch (error) {
        console.error("Error fetching Penalty record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const penltyId = req.query.id;
        const penltyPayld = req.body;
        const user = req.user;

        Object.assign(penltyPayld, { status: 'Active', updatedby: user._id });
        const updatedPenlty = await penltyModel.findByIdAndUpdate(penltyId, penltyPayld, { new: true });
        if (!updatedPenlty) {
            return res.status(404).json({ message: "Penalty record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Penalty record updated successfully",
            statuscode: 200,
            data: updatedPenlty
        });
    } catch (error) {
        console.error("Error updating Penalty record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const penltyId = req.query.id;
        const deletedPenlty = await penltyModel.findByIdAndDelete(penltyId);
        if (!deletedPenlty) {
            return res.status(404).json({ message: "Penalty record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Penalty record deleted successfully",
            statuscode: 200,
            data: deletedPenlty
        });
    } catch (error) {
        console.error("Error deleting Penalty record:", error);
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