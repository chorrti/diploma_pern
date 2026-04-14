import api from './client';

// Экспортируем типы (для использования в других файлах)
export interface Thematic {
    id: number;
    name: string;
}

export interface Competition {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    resultsDate: string;
    regulationFilePath: string;
    thematicId: number;
    thematicName: string;
    status: 'open' | 'closed' | 'archived';
}

/**
 * Получить список всех тематик
 */
export const fetchThematics = async (): Promise<Thematic[]> => {
    const response = await api.get('/thematics');
    return response.data;
};

/**
 * Получить список конкурсов с фильтрацией
 * @param status - open, archived
 * @param thematicId - ID тематики (опционально)
 */
export const fetchCompetitions = async (
    status: string, 
    thematicId?: number | null
): Promise<Competition[]> => {
    let url = `/competitions?status=${status}`;
    if (thematicId) {
        url += `&thematicId=${thematicId}`;
    }
    const response = await api.get(url);
    return response.data;
};

/**
 * Получить один конкурс по ID
 */
export const fetchCompetitionById = async (id: number): Promise<Competition> => {
    const response = await api.get(`/competitions/${id}`);
    return response.data;
};

/**
 * Изменить статус конкурса
 */
export const updateCompetitionStatus = async (id: number, status: string): Promise<void> => {
    await api.patch(`/competitions/${id}/status`, { status });
};


/**
 * Создать новый конкурс
 */
export const createCompetition = async (data: FormData): Promise<{ id: number }> => {
    const response = await api.post('/competitions', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Обновить конкурс
 */
export const updateCompetition = async (id: number, data: FormData): Promise<void> => {
    await api.put(`/competitions/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

/**
 * Удалить конкурс (мягкое удаление)
 */
export const deleteCompetition = async (id: number): Promise<void> => {
    await api.delete(`/competitions/${id}`);
};

