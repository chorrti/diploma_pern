/**
 * Преобразует ISO дату (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss.sssZ) в формат ДД.ММ.ГГГГ
 * @param dateString - дата от бэка, например "2025-01-15" или "2024-03-29T17:00:00.000Z"
 * @returns строка "15.01.2025"
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // Берём только первые 10 символов (YYYY-MM-DD)
    // Если строка длиннее, отрезаем время
    const isoDate = dateString.split('T')[0];
    
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
};

/**
 * Преобразует полный путь к файлу в относительный URL для скачивания
 * @param filePath - путь от бэка, например "/uploads/regulations/file.pdf"
 * @returns полный URL для браузера
 */
export const getFileUrl = (filePath: string): string => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `http://localhost:5000${filePath}`;
};