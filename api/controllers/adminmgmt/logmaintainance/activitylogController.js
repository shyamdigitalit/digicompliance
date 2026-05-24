import activitylogModel from "../../../models/adminmgmt/logmaintainance/activitylogModel.js";
import funcModel from "../../../models/adminmgmt/function/funcModel.js";
import asciiGenerator from "../../../utilities/asciiGenrator.js";
import { data } from "react-router-dom";

// Reusable functions
const toObjectId = v => (isValidObjectId(v) ? new mongoose.Types.ObjectId(v) : null);
const fetchAll = async () => {
    const activitylogs = await activitylogModel.find().sort({ updatedAt: -1 }).populate('activityReferenceFunction activityReferenceBy')
    return activitylogs
}

// Handlers
const create = async (req, res) => {
    try {
        const activitylogPayload = req.body
        const user = req.user
        const funcCode = activitylogPayload.activityReferenceFunction
        const funcDetails = await funcModel.findOne({ code: funcCode })
        activitylogPayload.activityReferenceFunction = funcDetails?._id
        activitylogPayload.activityCode = asciiGenerator(`${activitylogPayload.activityName}${funcCode}${activitylogPayload.activityReferenceUniqueFieldName}${activitylogPayload.activityReferenceUniqueFieldValue}`)
        activitylogPayload.activityReferenceBy = user._id

        const existingLog = await activitylogModel.findOne({ activityCode: activitylogPayload.activityCode }).populate('activityReferenceFunction activityReferenceBy')
        if (existingLog) {
            delete activitylogPayload.activityCode
            const updatedLog = await activitylogModel.findByIdAndUpdate(existingLog?._id, activitylogPayload, { new: true })
            if (updatedLog) return res.status(201).json({ message: 'Old Activity log updated successfully', success: true, data: existingLog })
        }
        else {
            const newActivitylog = new activitylogModel(activitylogPayload)
            const savedActivitylog = await newActivitylog.save()
            res.status(201).json({ message: 'Activity log created successfully', success: true, data: savedActivitylog })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error', success: false })
    }
}
const read = async (req, res) => {
    try {
        const activitylogs = await fetchAll()
        res.status(200).json({ message: 'Activity logs retrieved successfully', success: true, data: activitylogs })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error', success: false })
    }
}
const readById = async (req, res) => {
    try {
        const activitylogId = req.params.id
        const activitylog = await activitylogModel.findById(activitylogId).populate('activityReferenceFunction activityReferenceBy')
        if (!activitylog) {
            return res.status(404).json({ error: 'Activity log not found', success: false })
        }
        res.status(200).json({ message: 'Activity log retrieved successfully', success: true, data: activitylog })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error', success: false })
    }
}
const update = async (req, res) => {
    try {
        const activitylogId = req.query.id
        const activitylogPayload = req.body
        if (activitylogPayload.activityReferenceFunction) {
            activitylogPayload.activityReferenceFunction = toObjectId(activitylogPayload.activityReferenceFunction)
        }
        const activitylog = await activitylogModel.findByIdAndUpdate(activitylogId, activitylogPayload, { new: true })
        .populate('activityReferenceFunction activityReferenceBy')
        if (!activitylog) {
            return res.status(404).json({ error: 'Activity log not found', success: false })
        }
        res.status(201).json({ message: 'Activity log updated successfully', success: true, data: activitylog })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error', success: false })
    }
}
const remove = async (req, res) => {
    try {
        const activitylogId = req.query.id
        const activitylog = await activitylogModel.findByIdAndDelete(activitylogId)
        if (!activitylog) {
            return res.status(404).json({ error: 'Activity log not found', success: false })
        }
        res.status(200).json({ message: 'Activity log deleted successfully', success: true })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error', success: false })
    }
}

export default {
    create,
    read,
    readById,
    update,
    remove
}