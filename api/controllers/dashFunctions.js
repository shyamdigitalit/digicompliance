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
            const status = item.status || '';
            if (!status) return acc;
            const existingStatus = acc.find(s => s.name === status);
            if (existingStatus) existingStatus.count += 1;
            else acc.push({ name: status, count: 1 });
            return acc;
        }, []);
        return statusCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByType = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const typeCounts = compliance.data.reduce((acc, item) => {
            const type = item.complianceType?.name || '';
            if (!type) return acc;
            const existingType = acc.find(t => t.name === type);
            if (existingType) existingType.count += 1;
            else acc.push({ name: type, count: 1 });
            return acc;
        }, []);
        return typeCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByCategory = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const categoryCounts = compliance.data.reduce((acc, item) => {
            const category = item.complianceCategorization?.name || '';
            if (!category) return acc;
            const existingCategory = acc.find(c => c.name === category);
            if (existingCategory) existingCategory.count += 1;
            else acc.push({ name: category, count: 1 });

            return acc;
        }, []);
        return categoryCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByFrequency = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const frequencyCounts = compliance.data.reduce((acc, item) => {
            const frequency = item.complianceFrequency?.name || '';
            if (!frequency) return acc;
            const existingFrequency = acc.find(c => c.name === frequency);
            if (existingFrequency) existingFrequency.count += 1;
            else acc.push({ name: frequency, count: 1 });
            return acc;
        }, []);
        return frequencyCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByCriticality = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const criticalityCounts = compliance.data.reduce((acc, item) => {
            const criticality = item.criticality?.name || '';
            if (!criticality) return acc;
            const existingCriticality = acc.find(c => c.name === criticality);
            if (existingCriticality) existingCriticality.count += 1;
            else acc.push({ name: criticality, count: 1 });
            return acc;
        }, []);
        return criticalityCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByPenaltyType = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const penaltyTypeCounts = compliance.data.reduce((acc, item) => {
            const penaltyType = item.penaltyType?.name || '';
            if (!penaltyType) return acc;
            const existingPenaltyType = acc.find(p => p.name === penaltyType);
            if (existingPenaltyType) existingPenaltyType.count += 1;
            else acc.push({ name: penaltyType, count: 1 });
            return acc;
        }, []);
        return penaltyTypeCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByPlant = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const plantCounts = compliance.data.reduce((acc, item) => {
            const plant = item.plant?.name || '';
            if (!plant) return acc;
            const existingPlant = acc.find(p => p.name === plant);
            if (existingPlant) existingPlant.count += 1;
            else acc.push({ name: plant, count: 1 });
            return acc;
        }, []);
        return plantCounts;
    } catch (error) {
        console.error(error)
    }
}

export const complianceByDepartment = async (user) => {
    try {
        const compliance = await fetchComplianceDetails(user);
        const departmentCounts = compliance.data.reduce((acc, item) => {
            const department = item.department?.name || '';
            if (!department) return acc;
            const existingDepartment = acc.find(d => d.name === department);
            if (existingDepartment) existingDepartment.count += 1;
            else acc.push({ name: department, count: 1 });
            return acc;
        }, []);
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
    complianceByFrequency,
    complianceByCriticality,
    complianceByPenaltyType,
    complianceByPlant,
    complianceByDepartment,
    complianceTrends
}