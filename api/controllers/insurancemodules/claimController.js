// claimController.js (refactored & optimized)
import mongoose from 'mongoose';
import claimModel from '../../models/insurancemodules/claimModel.js';
import { uploadFile, deleteFile } from '../../utilities/fileOperations.js';

/**
 * Helpers
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const safeJSONParse = (val, fallback = []) => {
  try {
    if (!val) return fallback;
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return parsed;
  } catch (e) {
    return fallback;
  }
};

/** Upload an array of files (expects multer buffers) and return { uploaded: [], duplicates: [] } */
const uploadFiles = async (files = [], userId) => {
  const uploaded = [];
  const duplicates = [];

  // upload serially or parallel? We do parallel but limit implicitly by Promise.all (original used serial loop).
  // Use Promise.allSettled so one failure doesn't abort all.
  const tasks = files.map(async (file) => {
    try {
      const result = await uploadFile(file.buffer, file.originalname, file.mimetype);
      if (result?.file) {
        uploaded.push({
          filId: result.file._id,
          filName: result.file.filename,
          filContentType: result?.file?.metadata?.contentType,
          filContentSize: result.file.length,
          filUploadStatus: 'Done',
          fileUploadedby: userId
        });
      }
    } catch (err) {
      // preserve "Duplicate file" behavior
      if (err?.message?.includes('Duplicate file')) {
        duplicates.push(file.originalname);
      } else {
        console.error('❌ Upload Error:', err?.message ?? err);
      }
    }
  });

  await Promise.allSettled(tasks);
  return { uploaded, duplicates };
};

/** Delete files given array of filId (can be strings or ObjectId). Executes deletes in parallel */
const deleteFiles = async (filIds = []) => {
  if (!Array.isArray(filIds) || filIds.length === 0) return;
  const tasks = filIds.map(async (fid) => {
    try {
      await deleteFile(fid);
    } catch (err) {
      console.error('❌ File Deletion Error:', err?.message ?? err);
    }
  });
  await Promise.allSettled(tasks);
};

/** Common lookup pipeline used by read and readOnPolicy to avoid duplication */
const commonLookupPipeline = [
  // policyInfo (policyoperations)
  {
    $lookup: {
      from: 'policyoperations',
      localField: 'policyInfo',
      foreignField: '_id',
      as: 'policyInfo'
    }
  },
  { $unwind: { path: '$policyInfo', preserveNullAndEmptyArrays: true } },

  // policyType
  {
    $lookup: {
      from: 'policytypes',
      localField: 'policyInfo.policyType',
      foreignField: '_id',
      as: 'policyTypeData'
    }
  },
  { $unwind: { path: '$policyTypeData', preserveNullAndEmptyArrays: true } },
  { $set: { 'policyInfo.policyType': '$policyTypeData' } },
  { $unset: 'policyTypeData' },

  // insurerName -> providers
  {
    $lookup: {
      from: 'providers',
      localField: 'policyInfo.insurerName',
      foreignField: '_id',
      as: 'insurerData'
    }
  },
  { $unwind: { path: '$insurerData', preserveNullAndEmptyArrays: true } },
  { $set: { 'policyInfo.insurerName': '$insurerData' } },
  { $unset: 'insurerData' },

  // insuredName -> companies
  {
    $lookup: {
      from: 'companies',
      localField: 'policyInfo.insuredName',
      foreignField: '_id',
      as: 'insuredData'
    }
  },
  { $unwind: { path: '$insuredData', preserveNullAndEmptyArrays: true } },
  { $set: { 'policyInfo.insuredName': '$insuredData' } },
  { $unset: 'insuredData' },

  // plantLocation -> units
  {
    $lookup: {
      from: 'units',
      localField: 'policyInfo.plantLocation',
      foreignField: '_id',
      as: 'plantLocationData'
    }
  },
  { $unwind: { path: '$plantLocationData', preserveNullAndEmptyArrays: true } },
  { $set: { 'policyInfo.plantLocation': '$plantLocationData' } },
  { $unset: 'plantLocationData' },

  // createdby & updatedby -> accounts
  {
    $lookup: {
      from: 'accounts',
      localField: 'createdby',
      foreignField: '_id',
      as: 'createdby'
    }
  },
  { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'accounts',
      localField: 'updatedby',
      foreignField: '_id',
      as: 'updatedby'
    }
  },
  { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },
            
  {
    $addFields: {
      expiryDateParsed: {
        $dateFromString: {
          dateString: "$policyInfo.expiryDate",
          format: "%d-%m-%Y %H:%M:%S",
          timezone: "+05:30"
        }
      }
    }
  },
  {
    $addFields: {
      diffInMillis: { $subtract: ["$expiryDateParsed", "$$NOW"] }
    }
  },
  // Date formatting (ITC timezone)
  {
    $addFields: {
      policyRenewalDaysPending: {
        days: {
          $floor: { $divide: [{ $abs: "$diffInMillis" }, 1000 * 60 * 60 * 24] }
        },
        hours: {
          $floor: {
            $divide: [
              { $mod: [{ $abs: "$diffInMillis" }, 1000 * 60 * 60 * 24] },
              1000 * 60 * 60
            ]
          }
        },
        minutes: {
          $floor: {
            $divide: [
              { $mod: [{ $abs: "$diffInMillis" }, 1000 * 60 * 60] },
              1000 * 60
            ]
          }
        },
        seconds: {
          $floor: {
            $divide: [
              { $mod: [{ $abs: "$diffInMillis" }, 1000 * 60] },
              1000
            ]
          }
        }
      },
      pendingRenewalDays: {
        $floor: { $divide: [{ $abs: "$diffInMillis" }, 1000 * 60 * 60 * 24] }
      },
      policyNo: '$policyInfo.policyNo',
      createdAtITC: {
        $dateToString: { format: '%d-%m-%Y %H:%M:%S', date: '$createdAt', timezone: '+05:30' }
      },
      updatedAtITC: {
        $dateToString: { format: '%d-%m-%Y %H:%M:%S', date: '$updatedAt', timezone: '+05:30' }
      }
    }
  }
];

/**
 * Controller Methods
 */

const create = async (req, res) => {
  try {
    const claimPayld = { ...(req.body || {}) };
    const user = req.user;

    // Claim duplicate check
    const existing = await claimModel.findOne({ claimId: claimPayld.claimId });
    if (existing) return res.status(409).json({ message: 'Claim details already exists' });

    // policyInfo -> convert to ObjectId if valid
    if (claimPayld?.policyInfo && isValidObjectId(claimPayld.policyInfo)) {
      claimPayld.policyInfo = new mongoose.Types.ObjectId(claimPayld.policyInfo);
    }

    // customFields safe parsing (preserve original behavior)
    claimPayld.customFields = safeJSONParse(claimPayld.customFields, []).filter((elm) => elm.fieldName !== '');

    // Must have files (otherDocs) — original code required at least one file
    const filesArr = (req.files && (req.files.otherDocs || req.files)) || [];
    // when multer single/multiple may place in req.files or req.files.otherDocs
    if (!filesArr || filesArr.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Upload files
    const { uploaded: uploadedFiles } = await uploadFiles(Array.isArray(filesArr) ? filesArr : [filesArr], user?._id);
    if (uploadedFiles.length > 0) claimPayld.otherDocs = uploadedFiles;

    // Set statuses and createdby
    if (user) {
      Object.assign(claimPayld, {
        status: 'Active',
        approvalStatus: 'Approved',
        currentPendingApprovalLevel: 0,
        createdby: user?._id
      });
    }

    const claim = await claimModel.create(claimPayld);
    if (!claim) return res.status(422).json({ message: 'Failed to add New Claim' });

    return res.status(201).json({ message: 'Claim details added successfully', data: claim });
  } catch (error) {
    console.error('Error creating Claim details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const read = async (req, res) => {
  try {
    const status = String(req.query.status || '').trim();
    const claimStatus = String(req.query.claimstatus || '').trim();
    const policy = String(req.query.policy || '').trim();

    const searchCriteria = {};
    if (policy) {
      // original used $or with policyInfo.policyNo OR policyInfo._id when valid
      searchCriteria.$or = [{ 'policyInfo.policyNo': policy }];
      if (isValidObjectId(policy)) searchCriteria.$or.push({ 'policyInfo._id': new mongoose.Types.ObjectId(policy) });
    }

    const pipeline = [
      ...(status.length > 0 ? [{ $match: { status: { $regex: `^${status}`, $options: 'i' } } }] : []),
      ...(claimStatus.length > 0 ? [{ $match: { claimStatus: { $regex: `^${claimStatus}`, $options: 'i' } } }] : []),
      ...commonLookupPipeline,
      ...(policy.length > 0 ? [{ $match: searchCriteria }] : []),
      { $sort: { updatedAt: -1 } }
    ];

    const claimRecords = await claimModel.aggregate(pipeline);
    return res.status(200).json({ message: 'Claim details retrieved successfully', data: claimRecords });
  } catch (error) {
    console.error('Error retrieving Claim details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const readById = async (req, res) => {
  try {
    const claimId = req.params.id;
    if (!isValidObjectId(claimId)) return res.status(404).json({ message: 'Claim details not found' });

    const claimRecord = await claimModel.findById(claimId).populate(['policyInfo', 'createdby', 'updatedby']).lean();
    if (!claimRecord) return res.status(404).json({ message: 'Claim details not found' });

    return res.status(200).json({ message: 'Claim details retrieved successfully', data: claimRecord });
  } catch (error) {
    console.error('Error retrieving Claim details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const readOnPolcy = async (req, res) => {
  try {
    const status = String(req.query.status || '').trim();
    const claimStatus = String(req.query.claimstatus || '').trim();

    const pipeline = [
      ...(status.length > 0 ? [{ $match: { status: { $regex: `^${status}`, $options: 'i' } } }] : []),
      ...(claimStatus.length > 0 ? [{ $match: { claimStatus: { $regex: `^${claimStatus}`, $options: 'i' } } }] : []),
      ...commonLookupPipeline,

      // group by policy and attach claim docs
      {
        $group: {
          _id: '$policyInfo._id',
          policyDetails: { $first: '$policyInfo' },
          totalClaims: { $sum: 1 },
          claimDetails: { $push: '$$ROOT' }
        }
      },
      // merge policyDetails into root (as original)
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$$ROOT', '$policyDetails']
          }
        }
      },
      { $unset: 'policyDetails' },
      { $sort: { _id: 1 } }
    ];

    const claimRecords = await claimModel.aggregate(pipeline);
    return res.status(200).json({ message: 'Claim details retrieved successfully', data: claimRecords });
  } catch (error) {
    console.error('Error retrieving Claim details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const rawId = req.query.id;
    if (!isValidObjectId(rawId)) return res.status(404).json({ message: 'Claim details not found' });
    const claimId = new mongoose.Types.ObjectId(rawId);

    const claimPayld = { ...(req.body || {}) };
    const user = req.user;

    // Remove unwanted fields (safe)
    [
      'serial', 'id', '_id', '__v', 'claimId', 'policyInfo', 'createdby', 'creationdt', 'creationtm',
      'createdAt', 'updatedAt', 'createdAtITC', 'updatedAtITC'
    ].forEach((f) => delete claimPayld[f]);

    // mark updatedby
    Object.assign(claimPayld, { updatedby: user?._id });

    // customFields safe parse
    claimPayld.customFields = safeJSONParse(claimPayld.customFields, []).filter((elm) => elm.fieldName !== '');

    // otherDocsExisting -> parse into claimPayld.otherDocs (original behaviour)
    if (claimPayld?.otherDocsExisting) {
      const parsed = safeJSONParse(claimPayld.otherDocsExisting, []);
      claimPayld.otherDocs = Array.isArray(parsed) ? parsed : [];
      delete claimPayld.otherDocsExisting;
    }

    // Extract otherDocs payload for comparison and remove from payload so update doesn't overwrite
    const otherDocsPayld = Array.isArray(claimPayld.otherDocs) ? claimPayld.otherDocs : [];
    delete claimPayld.otherDocs;

    // Approval logic (kept as original)
    let apprvFlg = 0;
    const highestApprvlLvl = parseInt(claimPayld?.highestApprvlLvl || '0', 10);
    delete claimPayld?.highestApprvlLvl;

    if (parseInt(claimPayld?.currentPendingApprovalLevel || '0', 10) > 0 && claimPayld?.approvalStatus !== 'Approved') {
      apprvFlg = 1;
      if (highestApprvlLvl > parseInt(claimPayld?.currentPendingApprovalLevel || '0', 10)) {
        claimPayld.status = 'Pending';
        claimPayld.currentPendingApprovalLevel = parseInt(claimPayld.currentPendingApprovalLevel || '0', 10) + 1;
        claimPayld.approvalStatus = `Pending L${claimPayld.currentPendingApprovalLevel} Approval`;
      } else if (highestApprvlLvl === parseInt(claimPayld?.currentPendingApprovalLevel || '0', 10)) {
        claimPayld.status = 'Active';
        claimPayld.currentPendingApprovalLevel = 0;
        claimPayld.approvalStatus = 'Approved';
      }
    } else {
      apprvFlg = 0;
      claimPayld.status = 'Open';
      claimPayld.currentPendingApprovalLevel = 1;
      claimPayld.approvalStatus = 'Pending L1 Approval';
    }

    // Apply main update (fields except otherDocs which we handle separately)
    const claimRecord = await claimModel.findByIdAndUpdate(claimId, { ...claimPayld }, { new: true });
    if (!claimRecord) return res.status(404).json({ message: 'Claim details not found' });

    // Determine files to remove (existing files not present in payload)
    const existingFiles = Array.isArray(claimRecord.otherDocs) ? claimRecord.otherDocs : [];
    const getFilesToRemove = (existingFilesArr, payloadFilesArr) =>
      (payloadFilesArr?.length > 0)
        ? existingFilesArr.filter((file) => !payloadFilesArr.some((f) => String(f.filId) === String(file.filId)))
        : existingFilesArr;

    const otherDocsRmv = getFilesToRemove(existingFiles, otherDocsPayld);
    // Delete files in parallel
    await deleteFiles(otherDocsRmv.map((f) => f.filId));

    // Remove file entries from doc
    const removalIds = otherDocsRmv.map((f) => f.filId);
    let updtClaimRecord = claimRecord;
    if (removalIds.length > 0) {
      updtClaimRecord = await claimModel.findByIdAndUpdate(
        claimId,
        { $pull: { otherDocs: { filId: { $in: removalIds } } } },
        { new: true }
      );
    }

    if (!updtClaimRecord) {
      // failure in removing attachments
      if (apprvFlg === 0) {
        return res.status(404).json({ message: 'Claim details update failed' });
      } else {
        return res.status(404).json({ message: 'Claim details changes approval failed' });
      }
    }

    // If new files uploaded with request, upload & push them
    const incomingFiles = (req.files && (req.files.otherDocs || req.files)) || [];
    if (incomingFiles && incomingFiles.length > 0) {
      const { uploaded: newlyUploaded } = await uploadFiles(Array.isArray(incomingFiles) ? incomingFiles : [incomingFiles], user?._id);
      if (newlyUploaded.length > 0) {
        updtClaimRecord = await claimModel.findByIdAndUpdate(
          claimId,
          { $push: { otherDocs: { $each: newlyUploaded } } },
          { new: true }
        );
      }
    } else {
      console.log('⚠️ No files uploaded');
    }

    // Final verification: if update didn't actually change doc content then treat as failed (keeps original semantics)
    // Note: findByIdAndUpdate returns doc; we can't rely on modifiedCount. We'll compare updtClaimRecord existence.
    if (!updtClaimRecord) {
      if (apprvFlg === 0) {
        return res.status(404).json({ message: 'Claim details update failed' });
      } else {
        return res.status(404).json({ message: 'Claim details changes approval failed' });
      }
    }

    // Success responses (preserve original different messages)
    if (apprvFlg === 0) {
      return res.status(201).json({ message: 'Claim details updated successfully', data: updtClaimRecord });
    } else {
      return res.status(201).json({ message: 'Claim details changes approved successfully', data: updtClaimRecord });
    }
  } catch (error) {
    console.error('Error updating Claim details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const statusUpdate = async (req, res) => {
  try {
    const rawId = req.query.id;
    if (!isValidObjectId(rawId)) return res.status(404).json({ message: 'Claim details not found' });
    const claimId = new mongoose.Types.ObjectId(rawId);
    const claimPayld = req.body;
    const user = req.user;

    const claimRecord = await claimModel.findById(claimId);
    if (!claimRecord) return res.status(404).json({ message: 'Claim details not found' });

    // Update status only
    const updtRes = await claimModel.findByIdAndUpdate(claimId, { status: claimPayld.status, updatedby: user?._id }, { new: true });
    if (!updtRes) return res.status(404).json({ message: 'Claim details update failed' });

    return res.status(201).json({ message: 'Claim details updated successfully', data: updtRes });
  } catch (error) {
    console.error('Error updating Claim status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const rawId = req.query.id;
    if (!isValidObjectId(rawId)) return res.status(404).json({ message: 'Claim details not found' });
    const claimId = new mongoose.Types.ObjectId(rawId);

    const claimRecord = await claimModel.findById(claimId);
    if (!claimRecord) return res.status(404).json({ message: 'Claim details not found' });

    const files = Array.isArray(claimRecord.otherDocs) ? claimRecord.otherDocs : [];
    // delete files in parallel
    await deleteFiles(files.map((f) => f.filId));

    const deletedClaim = await claimModel.findByIdAndDelete(claimId);
    if (!deletedClaim) return res.status(404).json({ message: 'Claim details not found' });

    return res.status(200).json({ message: 'Claim details and associated files deleted successfully', data: deletedClaim });
  } catch (error) {
    console.error('Error deleting Claim details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  create,
  read,
  readById,
  readOnPolcy,
  update,
  statusUpdate,
  remove
};
