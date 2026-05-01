import {
    totalCompliance,
    complianceByStatus,
    // complianceByType,
    // complianceByCategory,
    // complianceByCriticality,
    // complianceByFrequency,
    // complianceByPlant,
    // complianceByDepartment,
    // complianceTrends
} from './dashFunctions.js';

const getDashboardData = async (req, res) => {
    try {
        const user = req.user;
        const total = await totalCompliance(user);
        const byStatus = await complianceByStatus(user);
        // const byType = await complianceByType(user);
        // const byCategory = await complianceByCategory(user);
        // const byCriticality = await complianceByCriticality(user);
        // const byFrequency = await complianceByFrequency(user);
        // const byPlant = await complianceByPlant(user);
        // const byDepartment = await complianceByDepartment(user);
        // const trends = await complianceTrends(user);
        return res.status(200).json({
            success: true,
            data: {
                total: total || 0,
                byStatus: byStatus || {},
                // byType,
                // byCategory,
                // byCriticality,
                // byFrequency,
                // byPlant,
                // byDepartment,
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