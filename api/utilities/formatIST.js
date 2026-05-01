/**
 * -----------------------------------
 * IST Date Format
 * -----------------------------------
 */

export const formatIST = (date) => {
    if (!date) return null;

    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date(date));
};