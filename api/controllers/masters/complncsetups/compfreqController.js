import compfreqModel from '../../../models/masters/complncsetups/compfreqModel.js';

const create = async (req, res) => {
    try {
        const compfreqPayld = req.body;
        const user = req.user;

        Object.assign(compfreqPayld, { status: 'Active', createdby: user._id });
        const existingCompfreq = await compfreqModel.findOne({ code: compfreqPayld.code });
        if (existingCompfreq) {
            return res.status(409).json({ message: "Compliance Frequency code already exists", statuscode: 409 });
        } else {
            const compfreq = await compfreqModel.create(compfreqPayld);
            if (!compfreq) {
                return res.status(401).json({ message: "Failed to create Compliance Frequency record" });
            } else {
                res.status(201).json({
                    message: "Compliance Frequency record created successfully",
                    statuscode: 201,
                    data: compfreq
                });
            }
        }
    } catch (error) {
        console.error("Error creating Compliance Frequency record:", error);
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
        const compfreqRecords = await compfreqModel.aggregate(pipeline)
        res.status(200).json({
            message: "Compliance Frequency records fetched successfully",
            statuscode: 200,
            data: compfreqRecords
        });
    } catch (error) {
        console.error("Error fetching Compliance Frequency records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const compfreqId = req.params.id;
        const compfreqRecord = await compfreqModel.findById(compfreqId).populate(['createdby', 'updatedby']);
        if (!compfreqRecord) {
            return res.status(404).json({ message: "Compliance Frequency record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Frequency record fetched successfully",
            statuscode: 200,
            data: compfreqRecord
        });
    } catch (error) {
        console.error("Error fetching Compliance Frequency record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const compfreqId = req.query.id;
        const compfreqPayld = req.body;
        const user = req.user;

        Object.assign(compfreqPayld, { status: 'Active', updatedby: user._id });
        const updatedCompfreq = await compfreqModel.findByIdAndUpdate(compfreqId, compfreqPayld, { new: true });
        if (!updatedCompfreq) {
            return res.status(404).json({ message: "Compliance Frequency record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Frequency record updated successfully",
            statuscode: 200,
            data: updatedCompfreq
        });
    } catch (error) {
        console.error("Error updating Compliance Frequency record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const compfreqId = req.query.id;
        const deletedCompfreq = await compfreqModel.findByIdAndDelete(compfreqId);
        if (!deletedCompfreq) {
            return res.status(404).json({ message: "Compliance Frequency record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Compliance Frequency record deleted successfully",
            statuscode: 200,
            data: deletedCompfreq
        });
    } catch (error) {
        console.error("Error deleting Compliance Frequency record:", error);
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