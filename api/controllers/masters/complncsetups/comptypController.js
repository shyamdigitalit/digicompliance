import comptypModel from '../../../models/masters/complncsetups/comptypModel.js'

const create = async (req, res) => {
    try {
        const comptypPayld = req.body;
        const user = req.user;

        Object.assign(comptypPayld, { status: 'Active', createdby: user._id });
        const existingComptyp = await comptypModel.findOne({ code: comptypPayld.code });
        if (existingComptyp) {
            return res.status(409).json({ message: "Compliance Type code already exists", statuscode: 409 });
        } else {
            const comptyp = await comptypModel.create(comptypPayld);
            if (!comptyp) {
                return res.status(401).json({ message: "Failed to create Compliance Type record" });
            } else {
                res.status(201).json({
                    message: "Compliance Type record created successfully",
                    statuscode: 201,
                    data: comptyp
                });
            }
        }
    } catch (error) {
        console.error("Error creating Compliance Type record:", error);
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
        const comptypRecords = await comptypModel.aggregate(pipeline)
        res.status(200).json({
            message: "Compliance Type records fetched successfully",
            statuscode: 200,
            data: comptypRecords
        });
    } catch (error) {
        console.error("Error fetching Compliance Type records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const comptypId = req.params.id;
        const comptypRecord = await comptypModel.findById(comptypId).populate(['createdby', 'updatedby']);
        if (!comptypRecord) {
            return res.status(404).json({ message: "Compliance Type record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Type record fetched successfully",
            statuscode: 200,
            data: comptypRecord
        });
    } catch (error) {
        console.error("Error fetching Compliance Type record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const comptypId = req.query.id;
        const comptypPayld = req.body;
        const user = req.user;

        Object.assign(comptypPayld, { status: 'Active', updatedby: user._id });
        const updatedComptyp = await comptypModel.findByIdAndUpdate(comptypId, comptypPayld, { new: true });
        if (!updatedComptyp) {
            return res.status(404).json({ message: "Compliance Type record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Type record updated successfully",
            statuscode: 200,
            data: updatedComptyp
        });
    } catch (error) {
        console.error("Error updating Compliance Type record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const comptypId = req.query.id;
        const deletedComptyp = await comptypModel.findByIdAndDelete(comptypId);
        if (!deletedComptyp) {
            return res.status(404).json({ message: "Compliance Type record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Type record deleted successfully",
            statuscode: 200,
            data: deletedComptyp
        });
    } catch (error) {
        console.error("Error deleting Compliance Type record:", error);
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