import api from './client';

/**
 * Скачать Excel файл с заявками конкурса
 */
export const downloadCompetitionExport = async (competitionId: number, contestName: string) => {
    const response = await api.get(`/export/competition/${competitionId}`, {
        responseType: 'blob'
    });
    
    // Очищаем имя от недопустимых символов
    const cleanName = contestName.replace(/[\\/:*?"<>|]/g, '');
    const fileName = `${cleanName}_все_заявки.xlsx`;
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};