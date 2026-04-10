import api from './client';
import type { Competition } from './contests';

export interface SearchParams {
    author: string;
    thematicId: number | null;
    competitionName: string;
}

/**
 * Поиск конкурсов с результатами по параметрам
 */
export const searchResults = async (params: SearchParams): Promise<Competition[]> => {
    const response = await api.post('/search/results', params);
    return response.data;
};