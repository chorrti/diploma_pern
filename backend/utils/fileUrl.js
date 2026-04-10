/**
 * Формирует полный URL для файла
 * @param {string} filePath - путь к файлу (например, "uploads/diplomas/file.pdf")
 * @returns {string} полный URL
 */
const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    // Если уже полный URL, возвращаем как есть
    if (filePath.startsWith('http')) return filePath;
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    // Убираем лишний слеш в начале
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    return `${baseUrl}/${cleanPath}`;
};

module.exports = getFileUrl;