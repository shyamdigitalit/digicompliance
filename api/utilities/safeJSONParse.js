export const safeJSONParse = (val, fallback = []) => {
    try {
        if (!val) return fallback;
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        return parsed;
    } catch (e) {
        return fallback;
    }
};