import {
    totalCompliance,
    complianceByStatus,
    complianceByType,
    complianceByCategory,
    complianceByFrequency,
    complianceByCriticality,
    complianceByPenaltyType,
    complianceByPlant,
    complianceByDepartment,
    // complianceTrends
} from './dashFunctions.js';

const getDashboardData = async (req, res) => {
    try {
        const user = req.user;
        const total = await totalCompliance(user);
        const byStatus = await complianceByStatus(user);
        const byType = await complianceByType(user);
        const byCategory = await complianceByCategory(user);
        const byFrequency = await complianceByFrequency(user);
        const byCriticality = await complianceByCriticality(user);
        const byPenaltyType = await complianceByPenaltyType(user);
        const byPlant = await complianceByPlant(user);
        const byDepartment = await complianceByDepartment(user);
        // const trends = await complianceTrends(user);
        return res.status(200).json({
            success: true,
            data: {
                total: total || 0,
                byStatus: byStatus || [],
                byType: byType || [],
                byCategory: byCategory || [],
                byFrequency: byFrequency || [],
                byCriticality: byCriticality || [],
                byPenaltyType: byPenaltyType || [],
                byPlant: byPlant || [],
                byDepartment: byDepartment || [],
                // trends
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export default {
    getDashboardData
}