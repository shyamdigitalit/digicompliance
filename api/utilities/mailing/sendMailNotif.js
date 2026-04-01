import { mailConfig } from "../../config/mailConfig.js";

export const sendMailNotif = async (notificationDetails, htmlContent, attachment=[]) => {
    try {
        if (!notificationDetails) {
            return { message: "Event not found" };
        }

        // map all recipients
        const allToMailIds = notificationDetails?.accounts && notificationDetails?.accounts?.length > 0
            ? notificationDetails.accounts.map(acc => acc.email).filter(email => !!email).join(", ")
            : null;

        // 🔹 Call your existing mailConfig
        const mailResInfo = await mailConfig(
            [allToMailIds],
            [],
            [],
            notificationDetails.subject,
            htmlContent,
            attachment,
        );

        return { message: `✅ Mail Notification successfully sent.`, res: mailResInfo }
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to send mail: ${error.message}`);
    }
};