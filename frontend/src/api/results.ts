import api from './client';

export interface Winner {
    id: number;
    fullName: string;
    degree: string;
    diplomaLink: string | null;
}

/**
 * Получить результаты конкурса по ID
 */
export const fetchResultsByCompetition = async (competitionId: number): Promise<Winner[]> => {
    const response = await api.get(`/results/competition/${competitionId}`);
    return response.data;
};