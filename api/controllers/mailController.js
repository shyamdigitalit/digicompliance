import { sendServiceMail } from "../configs/graphMailService.js";

const testMail = async (req, res) => {
    try {
        await sendServiceMail({
            to: req.body.to,
            subject: "MERN Graph Mail Test",
            html: "<h2>Service Mail Working Successfully ✅</h2>",
        });

        res.status(200).json({ message: "Mail sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Mail failed", error: error.message });
    }
};

export default testMail