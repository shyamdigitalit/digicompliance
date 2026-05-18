// Shared Activity Log Utility
// Stores recent activities in localStorage so Dashboard can read them

const ACTIVITY_KEY = "activity_log";
const MAX_ACTIVITIES = 20;

/**
 * Log an activity action
 * @param {string} action - e.g. "Compliance Added", "Compliance Updated", "Compliance Deleted", "Compliance Downloaded", "Document Uploaded", "Document Downloaded"
 * @param {string} detail - optional detail e.g. compliance ID or file name
 * @param {object} user - user object from redux (acc_fname, acc_lname, acc_email, etc.)
 */
export function logActivity(action, detail, user) {
  try {
    const existing = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    const userName =
      user?.acc_fname
        ? `${user.acc_fname}${user.acc_lname ? " " + user.acc_lname : ""}`
        : user?.acc_email || "Unknown User";

    const entry = {
      text: detail ? `${action} – ${detail}` : action,
      user: userName,
      time: new Date().toISOString(),
    };

    const updated = [entry, ...existing].slice(0, MAX_ACTIVITIES);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}

/**
 * Read the activity log
 * @returns {Array} list of activity entries
 */
export function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Format a stored ISO time string into a human-readable relative time
 */
export function formatActivityTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}
