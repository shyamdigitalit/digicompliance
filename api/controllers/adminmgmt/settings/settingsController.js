import settingsModel from "../../../models/adminmgmt/settings/settingsModel.js";

const updateSettings = async (req, res) => {
    try {
        const { notifTime } = req.body;
        const settings = await settingsModel.findByIdAndUpdate(
            'APP_SETTINGS',
            { notifTime },
            { new: true, upsert: true }
        );
        res.status(201).json({ message: 'Settings updated successfully', data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSettings = async (req, res) => {
    try {
        const settings = await settingsModel.findById('APP_SETTINGS');
        res.status(200).json({ message: 'Settings fetched successfully', data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { updateSettings, getSettings };