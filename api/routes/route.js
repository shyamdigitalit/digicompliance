import express from 'express';
import { basicAuth, jwtHybrdProtect } from '../middlewares/authMiddleware.js';
const router = express.Router();
import fileUpload from '../middlewares/fileUpload.js';
import testMail from '../controllers/mailController.js';
import settingsController from '../controllers/adminmgmt/settings/settingsController.js';

import complianceController from '../controllers/compliance_modules/complianceController.js';

import acctypController from '../controllers/masters/accsetups/acctypController.js';
import deptController from '../controllers/masters/accsetups/deptController.js';
import desigController from '../controllers/masters/accsetups/desigController.js';
import cmpnyController from '../controllers/masters/admin/cmpnyController.js';
import plntController from '../controllers/masters/admin/plntController.js';

import comptypController from '../controllers/masters/complncsetups/comptypController.js';
import compcategController from '../controllers/masters/complncsetups/compcategController.js';
import compfreqController from '../controllers/masters/complncsetups/compfreqController.js';
import criticltyController from '../controllers/masters/complncsetups/criticltyController.js';
import penltyController from '../controllers/masters/complncsetups/penltyController.js';

import funcController from '../controllers/adminmgmt/function/funcController.js';
import accController from '../controllers/accController.js';
import dashController from '../controllers/dashController.js';
import dynapprvlController from '../controllers/adminmgmt/dynapproval/dynapprvlController.js';
import fileOpController from '../controllers/fileOpController.js';
import activitylogController from '../controllers/adminmgmt/logmaintainance/activitylogController.js';


// Utility function to create routes
const createRoute = (method, path, ...handlers) => {
    router.route(path)[method](...handlers);
};

// PING
createRoute('get', '/', (_, res) => res.json({ message: 'Server is Live...', statuscode: 200 }));
createRoute('get', '/chckstat', (_, res) => res.json({ message: 'Server is Online Now...', statuscode: 200 }));

// POST
const postRoutes = [
    { path: '/send-mail', handlers: [jwtHybrdProtect, fileUpload.none(), testMail] },
    { path: '/settings/update', handlers: [jwtHybrdProtect, fileUpload.none(), settingsController.updateSettings] },
    { path: '/comp/create', handlers: [ jwtHybrdProtect, fileUpload.fields([ { name: "allDocs" } ]), complianceController.create ]},
    { path: '/acctyp/create', handlers: [jwtHybrdProtect, fileUpload.none(), acctypController.create] },
    { path: '/dept/create', handlers: [jwtHybrdProtect, fileUpload.none(), deptController.create] },
    { path: '/desig/create', handlers: [jwtHybrdProtect, fileUpload.none(), desigController.create] },
    { path: '/cmpny/create', handlers: [jwtHybrdProtect, fileUpload.none(), cmpnyController.create] },
    { path: '/plnt/create', handlers: [jwtHybrdProtect, fileUpload.none(), plntController.create] },
    { path: '/comptyp/create', handlers: [jwtHybrdProtect, fileUpload.none(), comptypController.create] },
    { path: '/compcateg/create', handlers: [jwtHybrdProtect, fileUpload.none(), compcategController.create] },
    { path: '/compfreq/create', handlers: [jwtHybrdProtect, fileUpload.none(), compfreqController.create] },
    { path: '/criticlty/create', handlers: [jwtHybrdProtect, fileUpload.none(), criticltyController.create] },
    { path: '/penlty/create', handlers: [jwtHybrdProtect, fileUpload.none(), penltyController.create] },
    { path: '/func/create', handlers: [jwtHybrdProtect, fileUpload.none(), funcController.create] },
    { path: '/acc/create', handlers: [jwtHybrdProtect, fileUpload.none(), accController.create] },
    { path: '/acc/import', handlers: [jwtHybrdProtect, fileUpload.none(), accController.upload] },
    { path: '/dynapprvl/create', handlers: [jwtHybrdProtect, fileUpload.none(), dynapprvlController.create] },
    { path: '/file/upload', handlers: [jwtHybrdProtect, fileUpload.fields([ { name: 'files' } ]), fileOpController.uploadHandler] },
    { path: '/activitylog/create', handlers: [jwtHybrdProtect, fileUpload.none(), activitylogController.create] },
    // { path: '/mail/send', handlers: [basicAuth, fileUpload.none(), mailtestController.send] },
];
postRoutes.forEach(route => createRoute('post', route.path, ...route.handlers));

// GET
const getRoutes = [
    { path: '/dash/fetch', handlers: [jwtHybrdProtect, dashController.getDashboardData] },
    { path: '/comp/fetch', handlers: [jwtHybrdProtect, complianceController.read] },
    { path: '/settings/fetch', handlers: [jwtHybrdProtect, settingsController.getSettings] },
    { path: '/acctyp/fetch', handlers: [jwtHybrdProtect, acctypController.read] },
    { path: '/acctyp/fetchby/:id', handlers: [jwtHybrdProtect, acctypController.readById] },
    { path: '/acctyp/fetchuppr', handlers: [jwtHybrdProtect, acctypController.readLowrHierarchy] },
    { path: '/dept/fetch', handlers: [jwtHybrdProtect, deptController.read] },
    { path: '/desig/fetch', handlers: [jwtHybrdProtect, desigController.read] },
    { path: '/cmpny/fetch', handlers: [jwtHybrdProtect, cmpnyController.read] },
    { path: '/plnt/fetch', handlers: [jwtHybrdProtect, plntController.read] },
    { path: '/comptyp/fetch', handlers: [jwtHybrdProtect, comptypController.read] },
    { path: '/compcateg/fetch', handlers: [jwtHybrdProtect, compcategController.read] },
    { path: '/compfreq/fetch', handlers: [jwtHybrdProtect, compfreqController.read] },
    { path: '/criticlty/fetch', handlers: [jwtHybrdProtect, criticltyController.read] },
    { path: '/penlty/fetch', handlers: [jwtHybrdProtect, penltyController.read] },
    { path: '/func/fetch', handlers: [jwtHybrdProtect, funcController.read] },
    { path: '/acc/fetch', handlers: [jwtHybrdProtect, accController.read] },
    { path: '/acc/fetchby/:id', handlers: [jwtHybrdProtect, accController.readById] },
    { path: '/acc/fetchuppr', handlers: [jwtHybrdProtect, accController.readLowrHierarchy] },
    { path: '/dynapprvl/fetch', handlers: [jwtHybrdProtect, dynapprvlController.read] },
    { path: '/dynapprvl/acc/filter', handlers: [jwtHybrdProtect, dynapprvlController.filterAccounts] },
    { path: '/file/fetch', handlers: [jwtHybrdProtect, fileOpController.getAllHandler] },
    { path: '/file/download/:id', handlers: [jwtHybrdProtect, fileOpController.getByIdHandler] },
    { path: '/file/downloadall', handlers: [jwtHybrdProtect, fileOpController.downloadAllHandler] },
    { path: '/activitylog/fetch', handlers: [jwtHybrdProtect, activitylogController.read] },
    { path: '/activitylog/fetchby/:id', handlers: [jwtHybrdProtect, activitylogController.readById] },
];
getRoutes.forEach(route => createRoute('get', route.path, ...route.handlers));

// PATCH
const patchRoutes = [
    { path: '/comp/update', handlers: [jwtHybrdProtect, fileUpload.fields([ { name: "allDocs" } ]), complianceController.update] },
    { path: '/comp/approve', handlers: [jwtHybrdProtect, fileUpload.none(), complianceController.approve] },
    { path: '/acctyp/update', handlers: [jwtHybrdProtect, fileUpload.none(), acctypController.update] },
    { path: '/dept/update/:id', handlers: [jwtHybrdProtect, fileUpload.none(), deptController.update] },
    { path: '/desig/update/:id', handlers: [jwtHybrdProtect, fileUpload.none(), desigController.update] },
    { path: '/cmpny/update', handlers: [jwtHybrdProtect, fileUpload.none(), cmpnyController.update] },
    { path: '/plnt/update/:id', handlers: [jwtHybrdProtect, fileUpload.none(), plntController.update] },
    { path: '/comptyp/update', handlers: [jwtHybrdProtect, fileUpload.none(), comptypController.update] },
    { path: '/compcateg/update', handlers: [jwtHybrdProtect, fileUpload.none(), compcategController.update] },
    { path: '/compfreq/update', handlers: [jwtHybrdProtect, fileUpload.none(), compfreqController.update] },
    { path: '/criticlty/update', handlers: [jwtHybrdProtect, fileUpload.none(), criticltyController.update] },
    { path: '/penlty/update', handlers: [jwtHybrdProtect, fileUpload.none(), penltyController.update] },
    { path: '/func/update', handlers: [jwtHybrdProtect, fileUpload.none(), funcController.update] },
    { path: '/acc/update', handlers: [jwtHybrdProtect, fileUpload.none(), accController.update] },
    { path: '/acc/changepass', handlers: [jwtHybrdProtect, fileUpload.none(), accController.changePassword] },
    { path: '/activitylog/update', handlers: [jwtHybrdProtect, fileUpload.none(), activitylogController.update] },
];
patchRoutes.forEach(route => createRoute('patch', route.path, ...route.handlers));

// DELETE
const deleteRoutes = [
    { path: '/comp/delete', handlers: [jwtHybrdProtect, complianceController.remove] },
    { path: '/acctyp/delete', handlers: [jwtHybrdProtect, acctypController.remove] },
    { path: '/dept/delete', handlers: [jwtHybrdProtect, deptController.remove] },
    { path: '/desig/delete', handlers: [jwtHybrdProtect, desigController.remove] },
    { path: '/cmpny/delete', handlers: [jwtHybrdProtect, cmpnyController.remove] },
    { path: '/plnt/delete', handlers: [jwtHybrdProtect, plntController.remove] },
    { path: '/comptyp/delete', handlers: [jwtHybrdProtect, comptypController.remove] },
    { path: '/compcateg/delete', handlers: [jwtHybrdProtect, compcategController.remove] },
    { path: '/compfreq/delete', handlers: [jwtHybrdProtect, compfreqController.remove] },
    { path: '/criticlty/delete', handlers: [jwtHybrdProtect, criticltyController.remove] },
    { path: '/penlty/delete', handlers: [jwtHybrdProtect, penltyController.remove] },
    { path: '/acc/delete', handlers: [jwtHybrdProtect, accController.remove] },
    { path: '/func/delete', handlers: [jwtHybrdProtect, funcController.remove] },
    { path: '/file/delete/:fileId', handlers: [jwtHybrdProtect, fileOpController.deleteHandler] },
    { path: '/file/delete/multiple', handlers: [jwtHybrdProtect, fileOpController.deleteManyHandler] },
    { path: '/activitylog/delete', handlers: [jwtHybrdProtect, activitylogController.remove] },
];
deleteRoutes.forEach(route => createRoute('delete', route.path, ...route.handlers));

export default router;