import plntModel from "../../../models/masters/admin/plntModel.js";

const create = async (req, res) => {
    try {
        const plntPayld = req.body;
        const user = req.user;

        Object.assign(plntPayld, { status: 'Active', createdby: user._id });
        const existingPlnt = await plntModel.findOne({ code: plntPayld.code });
        if (existingPlnt) {
            return res.status(409).json({ message: "Plant code already exists", statuscode: 409 });
        } else {
            const plnt = await plntModel.create(plntPayld);
            if (!plnt) {
                return res.status(401).json({ message: "Failed to create Plant record" });
            } else {
                res.status(201).json({
                    message: "Plant record created successfully",
                    statuscode: 201,
                    data: plnt
                });
            }
        }
    } catch (error) {
        console.error("Error creating Plant record:", error);
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
            { $sort: { updatedAt: 1 } }
        ]
        const plntRecords = await plntModel.aggregate(pipeline)
        res.status(200).json({
            message: "Plant records fetched successfully",
            statuscode: 200,
            data: plntRecords
        });
    } catch (error) {
        console.error("Error fetching Plant records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const plntId = req.params.id;
        const plntRecord = await plntModel.findById(plntId).populate(['createdby', 'updatedby']);
        if (!plntRecord) {
            return res.status(404).json({ message: "Plant record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Plant record fetched successfully",
            statuscode: 200,
            data: plntRecord
        });
    } catch (error) {
        console.error("Error fetching Plant record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const plntId = req.params.id;
        const plntPayld = req.body;
        const user = req.user;

        Object.assign(plntPayld, { status: 'Active', updatedby: user._id });
        const updatedPlnt = await plntModel.findByIdAndUpdate(plntId, plntPayld, { new: true });
        if (!updatedPlnt) {
            return res.status(404).json({ message: "Plant record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Plant record updated successfully",
            statuscode: 200,
            data: updatedPlnt
        });
    } catch (error) {
        console.error("Error updating Plant record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const plntId = req.query.id;
        const deletedPlnt = await plntModel.findByIdAndDelete(plntId);
        if (!deletedPlnt) {
            return res.status(404).json({ message: "Plant record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Plant record deleted successfully",
            statuscode: 200,
            data: deletedPlnt
        });
    } catch (error) {
        console.error("Error deleting Plant record:", error);
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