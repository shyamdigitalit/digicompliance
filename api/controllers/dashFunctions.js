import complianceModel from "../models/compliance_modules/complianceModel.js";
import plntModel from "../models/masters/admin/plntModel.js";
import deptModel from "../models/masters/accsetups/deptModel.js";
import compcategModel from "../models/masters/complncsetups/compcategModel.js";
import comptypModel from "../models/masters/complncsetups/comptypModel.js";
import compfreqModel from "../models/masters/complncsetups/compfreqModel.js";
import criticltyModel from "../models/masters/complncsetups/criticltyModel.js";
import penltyModel from "../models/masters/complncsetups/penltyModel.js";
import { fetchComplianceDetails } from "./compliance_modules/complianceController.js";



// Cards Calculations functions ================================================================================
export const totalCompliance = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        // console.log(compliance.data);
        return compliance.data.length;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByStatus = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const statusCounts = compliance.data.reduce((acc, item) => {
            const status = item.status || 'Unknown';
            if (status === 'Open' || status === 'Pending' || status === 'Active' || status === 'Inactive' || status === 'Closed') {
                acc[status] = (acc[status] || 0) + 1;
            }
            return acc;
        }, {});
        return statusCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByType = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const typeCounts = compliance.data.reduce((acc, item) => {
            const type = item.comp_typ?.name || 'Uncategorized';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        return typeCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByCategory = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const categoryCounts = compliance.data.reduce((acc, item) => {
            const category = item.comp_categ?.name || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        return categoryCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByCriticality = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const criticalityCounts = compliance.data.reduce((acc, item) => {
            const criticality = item.criticlty?.name || 'Uncategorized';
            acc[criticality] = (acc[criticality] || 0) + 1;
            return acc;
        }, {});
        return criticalityCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByFrequency = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const frequencyCounts = compliance.data.reduce((acc, item) => {
            const frequency = item.comp_freq?.name || 'Uncategorized';
            acc[frequency] = (acc[frequency] || 0) + 1;
            return acc;
        }, {});
        return frequencyCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByPlant = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const plantCounts = compliance.data.reduce((acc, item) => {
            const plant = item.plnt?.name || 'Uncategorized';
            acc[plant] = (acc[plant] || 0) + 1;
            return acc;
        }, {});
        return plantCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByDepartment = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const departmentCounts = compliance.data.reduce((acc, item) => {
            const department = item.dept?.name || 'Uncategorized';
            acc[department] = (acc[department] || 0) + 1;
            return acc;
        }, {});
        return departmentCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceTrends = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const trends = compliance.data.reduce((acc, item) => {
            const month = new Date(item.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
        return trends;
    } catch (error) {
        console.error(error)
    }
}

export default {
    totalCompliance,
    complianceByStatus,
    complianceByType,
    complianceByCategory,
    complianceByCriticality,
    complianceByFrequency,
    complianceByPlant,
    complianceByDepartment,
    complianceTrends
}