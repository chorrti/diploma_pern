import api from './client';

export interface ExhibitionWork {
    id: number;
    author: string;
    city: string;
    imageUrl: string | null;
    thematicId: number;
    thematicName: string;
    competitionId: number;
}

export interface ExhibitionWorkDetails {
    id: number;
    author: {
        familia: string;
        name: string;
        otchestvo: string;
        fullName: string;
        organization: string;
        city: string;
        phone: string;
        email: string;
    };
    teacher: {
        fullName: string;
    } | null;
    work: {
        title: string;
        description: string;
        imageUrl: string | null;
        linkUrl: string | null;
    };
}

/**
 * Получить список работ для выставки (с фильтром по тематике)
 */
export const fetchExhibitionWorks = async (thematicId?: number | null): Promise<ExhibitionWork[]> => {
    let url = '/exhibition';
    if (thematicId) {
        url += `?thematicId=${thematicId}`;
    }
    const response = await api.get(url);
    return response.data;
};

/**
 * Получить детальную информацию о работе для модального окна
 */
export const fetchExhibitionWorkDetails = async (id: number): Promise<ExhibitionWorkDetails> => {
    const response = await api.get(`/exhibition/${id}`);
    return response.data;
};

/**
 * Удалить работу с выставки (только для модератора)
 */
export const deleteExhibitionWork = async (id: number): Promise<void> => {
    await api.delete(`/exhibition/${id}`);
};

/**
 * Получить список заявок на выставку для модератора
 */
export const fetchModeratorExhibition = async (): Promise<any[]> => {
    const response = await api.get('/exhibition/moderator');
    return response.data;
};

/**
 * Опубликовать работу на выставке
 */
export const publishExhibitionWork = async (id: number): Promise<void> => {
    await api.post(`/exhibition/${id}/publish`);
};

/**
 * Отклонить заявку на выставку
 */
export const rejectExhibitionWork = async (id: number): Promise<void> => {
    await api.delete(`/exhibition/${id}/reject`);
};