import criticltyModel from "../../../models/masters/complncsetups/criticltyModel.js";

const create = async (req, res) => {
    try {
        const criticltyPayld = req.body;
        console.log(criticltyPayld);
        const user = req.user;

        Object.assign(criticltyPayld, { status: 'Active', createdby: user._id });
        const existingCriticlty = await criticltyModel.findOne({ code: criticltyPayld.code });
        if (existingCriticlty) {
            return res.status(409).json({ message: "Criticality code already exists", statuscode: 409 });
        } else {
            const criticlty = await criticltyModel.create(criticltyPayld);
            if (!criticlty) {
                return res.status(401).json({ message: "Failed to create Criticality record" });
            } else {
                res.status(201).json({
                    message: "Criticality record created successfully",
                    statuscode: 201,
                    data: criticlty
                });
            }
        }
    } catch (error) {
        console.error("Error creating Criticality record:", error);
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
        const criticltyRecords = await criticltyModel.aggregate(pipeline)
        res.status(200).json({
            message: "Criticality records fetched successfully",
            statuscode: 200,
            data: criticltyRecords
        });
    } catch (error) {
        console.error("Error fetching Criticality records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const criticltyId = req.params.id;
        const criticltyRecord = await criticltyModel.findById(criticltyId).populate(['createdby', 'updatedby']);
        if (!criticltyRecord) {
            return res.status(404).json({ message: "Criticality record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Criticality record fetched successfully",
            statuscode: 200,
            data: criticltyRecord
        });
    } catch (error) {
        console.error("Error fetching Criticality record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const criticltyId = req.query.id;
        const criticltyPayld = req.body;
        const user = req.user;

        Object.assign(criticltyPayld, { status: 'Active', updatedby: user._id });
        const updatedCriticlty = await criticltyModel.findByIdAndUpdate(criticltyId, criticltyPayld, { new: true });
        if (!updatedCriticlty) {
            return res.status(404).json({ message: "Criticality record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Criticality record updated successfully",
            statuscode: 200,
            data: updatedCriticlty
        });
    } catch (error) {
        console.error("Error updating Criticality record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const criticltyId = req.query.id;
        const deletedCriticlty = await criticltyModel.findByIdAndDelete(criticltyId);
        if (!deletedCriticlty) {
            return res.status(404).json({ message: "Criticality record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Criticality record deleted successfully",
            statuscode: 200,
            data: deletedCriticlty
        });
    } catch (error) {
        console.error("Error deleting Criticality record:", error);
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