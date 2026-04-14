import api from './client';

export interface Winner {
    id: number;
    fullName: string;
    degree: string;
    diplomaLink: string | null;
}
export interface PublishResultData {
    applicationId: number;
    degreeId: number;
}

/**
 * Получить результаты конкурса по ID
 */
export const fetchResultsByCompetition = async (competitionId: number): Promise<Winner[]> => {
    const response = await api.get(`/results/competition/${competitionId}`);
    return response.data;
};

/**
 * Опубликовать результаты конкурса
 */
export const publishCompetitionResults = async (competitionId: number, results: PublishResultData[], files: File[]) => {
    const formData = new FormData();
    formData.append('results', JSON.stringify(results));
    files.forEach(file => {
        formData.append('diplomas', file);
    });
    
    const response = await api.post(`/results/competition/${competitionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};