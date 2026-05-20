import accModel from '../models/accModel.js';
import acctypModel from '../models/masters/accsetups/acctypModel.js';
// import cloudinary from '../libraries/cloudinary.js';
import { hashPassword, comparePassword } from '../utilities/hashPassword.js';
import dataPagination from '../utilities/dataPagination.js';
import moment from 'moment';
import mongoose, { isValidObjectId } from 'mongoose';


const create = async (req, res) => {
    const accPayload = req.body
    const user = req.user
    const hashpass = hashPassword(accPayload?.acc_pass);

    try {
        const Accexst = await accModel.findOne({ acc_uname: accPayload?.acc_uname })
        .populate([ 'acc_typ', 'createdby', 'updatedby' ]);

        if (Accexst) {
            res.status(409).json({ message: 'Account already exists!', statuscode: 409, data: Accexst });
        }

        const acc_plnt = isValidObjectId(accPayload?.acc_plnt) ? new mongoose.Types.ObjectId(accPayload?.acc_plnt) : null;
        const acc_dept = isValidObjectId(accPayload?.acc_dept) ? new mongoose.Types.ObjectId(accPayload?.acc_dept) : null;
        const acc_desig = isValidObjectId(accPayload?.acc_desig) ? new mongoose.Types.ObjectId(accPayload?.acc_desig) : null;

        Object.assign(accPayload, {
            acc_pass: hashpass,
            acc_pass_bckup: accPayload?.acc_pass,
            acc_plnt: acc_plnt && acc_plnt,
            acc_dept: acc_dept && acc_dept,
            acc_desig: acc_desig && acc_desig,
            createdby: user?._id
        })
        const Acc = await accModel.create(accPayload);

        if (Acc) {
            res.status(201).json({ message: 'Account created successfully.', statuscode: 201, data: Acc });
        }
        else {
            res.status(500).json({ message: 'Account creation failed!', statuscode: 500 });
        }
    } catch (error) {
        console.error(error);
    }
};

const upload = async (req, res) => {
    try {
        const accPayload = req.body
        const user = req.user
        const resfl = accPayload

        if (!accPayload || !Array.isArray(accPayload) || accPayload.length === 0) {
            return res.status(400).json({ message: "Invalid or empty data" });
        }
        else {
            for (let i=0; i < accPayload.length; i++) {
                const accData = accPayload[i]
                const exstngAcctyp = await acctypModel.findOne({ typname: accData.type })
                if (!exstngAcctyp) {
                    resfl[i].upload_status = 'Error'
                    resfl[i].upload_message = `Account Type: "${accData.type}" does not exist`
                }
                else {
                    const exstngAcc = await accModel.findOne({ acc_uname: accData.username })
                    if (!exstngAcc) {
                        const newAcc = await accModel.create({
                            acc_uname: accData.username,
                            acc_pass: hashPassword(accData.password),
                            acc_pass_bckup: accData.password,
                            acc_eml: accData.email,
                            acc_phn: accData.phone,
                            acc_fname: accData.fullname,
                            acc_typ: exstngAcctyp._id,
                            acc_comp: accData.company,
                            acc_emp_code: accData.employeecode,
                            acc_status: 'Active',
                            createdby: user._id,
                            creation_dt: String(moment().format('DD/MM/YYYY')),
                            creation_tm: String(moment().format('hh:mm:ss a'))
                        })
                        if (newAcc) {
                            resfl[i].upload_status = 'Success'
                            resfl[i].upload_message = 'Created Successfully'
                        }
                        else {
                            resfl[i].upload_status = 'Error'
                            resfl[i].upload_message = 'Failed to Upload'
                        }
                    }
                    else {
                        const updtdAcc = await accModel.updateOne({ acc_uname: accData.username }, {
                            acc_eml: accData.email,
                            acc_phn: accData.phone,
                            acc_fname: accData.fullname,
                            acc_comp: accData.company,
                            acc_emp_code: accData.employeecode,
                            acc_status: 'Active',
                            updatedby: user._id,
                            update_dt: String(moment().format('DD/MM/YYYY')),
                            update_tm: String(moment().format('hh:mm:ss a'))
                        }, { new: true })
                        if (updtdAcc) {
                            resfl[i].upload_status = 'Success'
                            resfl[i].upload_message = 'Updated Successfully'
                        }
                        else {
                            resfl[i].upload_status = 'Error'
                            resfl[i].upload_message = 'Failed to Upload'
                        }
                    }
                }
            }
            if (resfl || resfl.length > 0) {
                return res.status(201).json({ message: 'Upload Summery', statuscode: 201, resfl })
            }
            else {
                return res.status(422).json({ message: 'Upload Issue Summery', statuscode: 422 })
            }
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal Server Error', statuscode: 500 })
    }
}

const read = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const typeLower = req.query.typel || 0;
        const typeHigher = req.query.typeh || 0;

        const searchCriteria = {};
        if (search) {
            searchCriteria.$or = [
                { acc_fname: { $regex: search || '', $options: 'i' } },
                { acc_uname: { $regex: search || '', $options: 'i' } },
                { acc_eml: { $regex: search || '', $options: 'i' } },
                { acc_phn: { $regex: search || '', $options: 'i' } },
                { 'acc_typ.typname': { $regex: search || '', $options: 'i' } }
            ];
        }
        if (typeLower && typeHigher) {
            searchCriteria['acc_typ.heirarchy'] = { 
                $gte: parseInt(typeLower), 
                $lte: parseInt(typeHigher) 
            };
        }
        const population = [
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
            ...(Object.keys(searchCriteria).length > 0 ? [{ $match: searchCriteria }] : []),
            { $addFields: {
                createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
            }},
            { $project: { acc_pass: 0, acc_pass_bckup: 0 } },
            { $sort: { updatedAt: -1 } }
        ]
        const sortingDetails = {
            fieldName: 'updatedAt',
            sortType: 'descending',
        }
        const { filteredData: Acc = [], totalCount = 0, hasMore = false } = await dataPagination( accModel, page, limit, population, sortingDetails );

        res.status(200).json({
            message: 'All Accounts data fetched successfully.',
            statuscode: 200,
            data: { Acc, totalCount, hasMore, page }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', statuscode: 500 });
    }
};

const readById = async (req, res) => {
    try {
        const accid = req.params.id;
        const Acc = await accModel.findOne({ _id: accid })
        .populate([ 'acc_typ', 'acc_plnt', 'acc_dept', 'acc_desig', 'createdby', 'updatedby' ]);

        if (Acc) {
            res.status(200).json({ message: 'Account data fetched successfully.', statuscode: 200, data: Acc });
        }
        else {
            res.status(404).json({ message: 'Account not found!', statuscode: 404 });
        }
    } catch (error) {
        console.error(error);
    }
};

const readLowrHierarchy = async (req, res) => {
    try {
        const user = req.user;
        const usrDtls = await accModel.findById(user._id).populate('acc_typ');
        const acctypid = usrDtls.acc_typ._id;

        const selectedType = await acctypModel.findById(acctypid).select('heirarchy');
        if (!selectedType) {
            return res.status(404).json({ message: 'Account type not found!', statuscode: 404 });
        }
        const selectedHeirarchy = parseInt(selectedType.heirarchy);

        const matchCriteria = {};
        matchCriteria.$and = [
            { _id: { $ne: user._id } },
            { 'acc_typ.heirarchy': { $gte: selectedHeirarchy } }
        ]

        const pipeln = [
            { $lookup: { from: 'accounttypes', localField: 'acc_typ', foreignField: '_id', as: 'acc_typ' } },
            { $unwind: { path: '$acc_typ', preserveNullAndEmptyArrays: true } },
            ...( matchCriteria.$and?.length ? [{ $match: matchCriteria }] : [] ),

            { $lookup: { from: 'plants', localField: 'acc_plnt', foreignField: '_id', as: 'acc_plnt' } },
            { $unwind: { path: '$acc_plnt', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'departments', localField: 'acc_dept', foreignField: '_id', as: 'acc_dept' } },
            { $unwind: { path: '$acc_dept', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'designations', localField: 'acc_desig', foreignField: '_id', as: 'acc_desig' } },
            { $unwind: { path: '$acc_desig', preserveNullAndEmptyArrays: true } },

            { $addFields: {
                createdAtITC: {
                    $dateToString: {
                        format: "%d-%m-%Y %H:%M:%S",
                        date: '$createdAt',
                        timezone: "+05:30"
                    }
                },
                updatedAtITC: {
                    $dateToString: {
                        format: "%d-%m-%Y %H:%M:%S",
                        date: '$updatedAt',
                        timezone: "+05:30"
                    }
                }
            }},
            { $sort: { updatedAt: -1 }}
        ]

        const accDta = await accModel.aggregate(pipeln);
        if (accDta.length > 0) {
            res.status(200).json({ message: 'Accounts with lower hierarchy fetched successfully.', statuscode: 200, data: { Acc: accDta } });
        } else {
            res.status(404).json({ message: 'No accounts found with lower hierarchy!', statuscode: 404 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', statuscode: 500 });
    }
}

const update = async (req, res) => {
    const accid = new mongoose.Types.ObjectId(req.query.id) || null;
    const accPayload = req.body
    // console.log(accPayload);
    const user = req.user
    // const filepath = req.file?.path;

    try {
        const Accexst = await accModel.findOne({ _id: accid })
        .populate([ 'acc_typ', 'createdby', 'updatedby' ]);

        if (Accexst) {
            delete accPayload?.acc_uname;
            delete accPayload?.acc_pass;
            delete accPayload?.acc_pass_bckup;
            delete accPayload?.acc_typ;
            delete accPayload?.createdby;

            const acc_plnt = isValidObjectId(accPayload?.acc_plnt) ? new mongoose.Types.ObjectId(accPayload?.acc_plnt) : null;
            const acc_dept = isValidObjectId(accPayload?.acc_dept) ? new mongoose.Types.ObjectId(accPayload?.acc_dept) : null;
            const acc_desig = isValidObjectId(accPayload?.acc_desig) ? new mongoose.Types.ObjectId(accPayload?.acc_desig) : null;

            Object.assign(accPayload, {
                acc_plnt: acc_plnt && acc_plnt,
                acc_dept: acc_dept && acc_dept,
                acc_desig: acc_desig && acc_desig,
                status: 'Active',
                updatedby: user?._id
            })

            const Accupdt = await accModel.findByIdAndUpdate(accid, accPayload, { new: true }).select('-acc_pass -acc_pass_bckup').populate([ 'acc_typ', 'acc_plnt', 'acc_dept', 'acc_desig', 'createdby', 'updatedby' ]);

            if (Accupdt) {
                res.status(201).json({ message: 'Account updated successfully.', statuscode: 201, data: Accupdt });
            }
            else {
                res.status(500).json({ message: 'Account update failed..!', statuscode: 500 });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const changePassword = async (req, res) => {
    try {
        const accid = new mongoose.Types.ObjectId(req.query.id) || null;
        const { currentPassword, newPassword } = req.body

        const account = await accModel.findById(accid)
        .populate([ 'acc_typ', 'acc_plnt', 'acc_dept', 'acc_desig', 'createdby', 'updatedby' ])
        .lean();
        const accValdt = comparePassword(currentPassword, account?.acc_pass);

        if (accValdt) {
            const hashpass = hashPassword(newPassword);
            const updatedAccount = await accModel.findByIdAndUpdate(accid, { acc_pass: hashpass, acc_pass_bckup: newPassword }, { new: true });
            res.status(201).json({ message: "Password has successfully changed.", success: true, data: updatedAccount })
        }
        else {
            res.status(404).json({ message: "Wrong Current Password provided!", success: false })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const accid = new mongoose.Types.ObjectId(req.query.id) || null;

        const deletedAcc = await accModel.findByIdAndDelete(accid);
        if (!deletedAcc) {
            return res.status(404).json({ message: "Policy Type details not found" });
        }
        res.status(200).json({
            message: "Policy Type details deleted successfully",
            data: deletedAcc
        });
    } catch (error) {
        console.error("Error deleting Policy Type details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default {
    create,
    upload,
    read,
    readById,
    readLowrHierarchy,
    update,
    changePassword,
    remove
};