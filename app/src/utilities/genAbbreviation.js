export const generateAbbreviation = (name) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    return words.map(word => word[0]).join('').toUpperCase();
};