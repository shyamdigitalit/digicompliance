import cron from "node-cron";
import moment from "moment";
import complianceModel from "../../models/compliance_modules/complianceModel.js";
import { mailConfig } from "../../configs/mailConfig.js";
import settingsModel from "../../models/adminmgmt/settings/settingsModel.js";

const sendNotification = async (emails, compliance, daysLeft) => {

  const subject = `Compliance Reminder - ${daysLeft} Days Remaining`;

  const html = `
    <p>Dear User,</p>
    <p>The following compliance is due in <b>${daysLeft} days</b>.</p>

    <p><b>Compliance ID:</b> ${compliance.complianceId}</p>
    <p><b>Due Date:</b> ${moment(compliance.complianceDate).format("DD-MM-YYYY")}</p>
    <p><b>Frequency:</b> ${compliance.complianceFrequency?.complianceFrequencyName}</p>

    <p>Please complete the compliance before the deadline.</p>

    <p>Regards,<br/>eCompliance System</p>
  `;

  const mailResponse = await mailConfig(emails, [], [], subject, html, []);
  if (mailResponse?.response) return { success: true, message: 'Email sent successfully', data: mailResponse };
  else return { success: false, message: 'Failed to send email' };
};

const calculateNextRenewDate = (complianceDate, frequency) => {
  switch (frequency?.toLowerCase()) {
    case "monthly":
      return moment(complianceDate).add(1, "month").startOf("day");
    case "quarterly":
      return moment(complianceDate).add(3, "month").startOf("day");
    case "half yearly":
      return moment(complianceDate).add(6, "month").startOf("day");
    case "yearly":
      return moment(complianceDate).add(1, "year").startOf("day");
    default:
      return null;
  }
};
const checkComplianceNotifications = async () => {
  try {

    console.log('into notif func entered.');
    const today = moment().startOf("day");

    const compliances = await complianceModel
      .find({ status: { $ne: "Closed" } })
      .populate("complianceFrequency")
      .populate("createdby");

    console.log(compliances?.length);
    for (const compliance of compliances) {
      // const complianceDate = moment(compliance.complianceDate).startOf("day");
      // const diffDays = complianceDate.diff(today, "days");
      
      const frequency = compliance?.complianceFrequency?.complianceFrequencyName?.toLowerCase();
      const nextRenewDate = calculateNextRenewDate(compliance.complianceDate, frequency);
      
      let notifyDays = [], notifyDates = [], diffDays = [];
      
      if (frequency === "monthly") {
        notifyDays = [15, 7, 1];
        notifyDates = notifyDays.map(days => moment(nextRenewDate)
        .subtract(days, "days")
        .startOf("day"));
        // diffDays = complianceDate.diff(today, "days");
      }
      
      if (
        frequency === "quarterly" ||
        frequency === "half yearly" ||
        frequency === "yearly"
      ) {
        notifyDays = [30, 15, 7, 1];
        notifyDates = notifyDays.map(days => moment(nextRenewDate)
        .subtract(days, "days")
        .startOf("day"));
      }

      console.log('compliances Id:', compliance.complianceId,
        // 'frequency:', frequency,
        'notifyDates:', notifyDates.map(date => date.format("DD-MM-YYYY"))
      );

      const isTodayInArray = notifyDates.some(date => date.isSame(today, 'day'));
      if (isTodayInArray) {
        console.log('today is a notif date.');
        const email = compliance?.createdby?.acc_eml;
        if (!email) continue;

        await sendNotification([email], compliance, diffDays);
        console.log(`Notification sent for ${compliance.complianceId} (${diffDays} days remaining)`);
      }
      else {
        console.log('today is not a notif date.');
      }
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  }
};

let activeComplianceJob = null;


export const complianceScheduler = async () => {
  const settings = await settingsModel.findById("APP_SETTINGS").lean();
  const notifHour = settings?.notifTime
      ? Number(settings.notifTime.split(":")[0])
      : 0;

  const notifMinute = settings?.notifTime
    ? Number(settings.notifTime.split(":")[1])
    : 0;


  // Stopping previous job if exists
  if (activeComplianceJob) {
    activeComplianceJob.stop();
    console.log("Stopping previous compliance jobs...");
  }
  // Runs everyday at 3:30 PM
  activeComplianceJob = cron.schedule(`${notifMinute} ${notifHour} * * *`, async () => {
    console.log("New compliance job created...");
    await checkComplianceNotifications();
  });

  console.log(`Compliance job scheduled for ${notifHour}:${notifMinute} daily.`);
};