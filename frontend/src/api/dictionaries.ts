import api from './client';

export interface Degree {
    id: number;
    name: string;
}

export interface Thematic {
    id: number;
    name: string;
}


/**
 * Получить список всех степеней
 */
export const fetchDegrees = async (): Promise<Degree[]> => {
    const response = await api.get('/dictionaries/degrees');
    return response.data;
};

/**
 * Добавить новую степень
 */
export const addDegree = async (name: string): Promise<Degree> => {
    const response = await api.post('/dictionaries/degrees', { name });
    return response.data;
};

/**
 * Удалить степень
 */
export const deleteDegree = async (id: number): Promise<void> => {
    await api.delete(`/dictionaries/degrees/${id}`);
};

/**
 * Получить список всех тематик
 */
export const fetchThematics = async (): Promise<Thematic[]> => {
    const response = await api.get('/dictionaries/thematics');
    return response.data;
};

/**
 * Добавить новую тематику
 */
export const addThematic = async (name: string): Promise<Thematic> => {
    const response = await api.post('/dictionaries/thematics', { name });
    return response.data;
};

/**
 * Удалить тематику
 */
export const deleteThematic = async (id: number): Promise<void> => {
    await api.delete(`/dictionaries/thematics/${id}`);
};