import axiosInstance from "../../config/axiosInstance";

const ACTIVITY_KEY = "activity_log";
const MAX_ACTIVITIES = 20;

export const logActivity = async (name='', description='', functionCode, referenceCollection='', referenceField='', referenceValue='', referenceInfo='') => {
    try {
        const existing = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || [])
        if (!functionCode) {
            alert(`* Function Code is Required.`)
            return;
        }
        
        const formData = new FormData()
        formData.append("activityName", name);
        formData.append("activityDescription", description);
        formData.append("activityReferenceFunction", functionCode);
        formData.append("activityReferenceCollection", referenceCollection);
        formData.append("activityReferenceUniqueFieldName", referenceField);
        formData.append("activityReferenceUniqueFieldValue", referenceValue);
        formData.append("activityReferenceInfo", referenceInfo);
        const response = await axiosInstance.post(`/api/activitylog/create`, formData)
        if (response.status===201) {
            const updated = [response.data.data, ...existing].slice(0, MAX_ACTIVITIES);
            localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
        }
        else {
            const updated = [...existing].slice(0, MAX_ACTIVITIES);
            localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
        }
    } catch (error) {
        console.error(error)
        return error
    }
}

export const getActivityLog = async () => {
    try {
        const response = await axiosInstance.get(`/api/activitylog/fetch`)
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify(response.data.data));
        return response.data.data;
    } catch (error) {
        console.error(error)
        return error
    }
}

export const formatActivityTime = (isoString) => {
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