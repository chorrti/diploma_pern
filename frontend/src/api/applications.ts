import api from './client';

export interface MyApplication {
    id: number;
    title: string;
    description: string;
    submittedAt: string;
    studentName: string;      // ← добавить
    organization: string;      // ← добавить
    city: string;              // ← добавить
    contest: {
        id: number;
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        resultsDate: string;
        status: string;
    };
    hasDiploma: boolean;
}

export interface MyDiploma {
    id: number;
    diplomaUrl: string;
    degree: string;
    workTitle: string;
    contest: {
        id: number;
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        resultsDate: string;
    };
}

export interface ApplicationDetails {
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
        agreedForExhibition: boolean;
    };
    submittedAt: string;
}

export const fetchMyApplications = async (): Promise<MyApplication[]> => {
    const response = await api.get('/applications/my');
    return response.data;
};

export const fetchMyDiplomas = async (): Promise<MyDiploma[]> => {
    const response = await api.get('/results/my');
    return response.data;
};

export const fetchApplicationDetails = async (id: number): Promise<ApplicationDetails> => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
};

export const checkMyApplicationForContest = async (contestId: number): Promise<{ hasSubmitted: boolean; applicationId: number | null }> => {
    try {
        const response = await api.get(`/applications/my/contest/${contestId}`);
        return response.data;
    } catch (error) {
        return { hasSubmitted: false, applicationId: null };
    }
};
/**
 * Получить список заявок ученика по ID (для учителя)
 */
export const fetchApplicationsByStudentId = async (studentId: number): Promise<MyApplication[]> => {
    const response = await api.get(`/applications/student/${studentId}`);
    return response.data;
};

/**
 * Получить список дипломов ученика по ID (для учителя)
 */
export const fetchDiplomasByStudentId = async (studentId: number): Promise<MyDiploma[]> => {
    const response = await api.get(`/results/student/${studentId}`);
    return response.data;
};

/**
 * Скачать все дипломы текущего пользователя архивом
 */
export const downloadAllDiplomas = async (): Promise<Blob> => {
    const response = await api.get('/results/my/zip', {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Получить детали заявки по ID (для учителя)
 */
export const fetchApplicationDetailsForTeacher = async (applicationId: number): Promise<ApplicationDetails> => {
    const response = await api.get(`/applications/${applicationId}/for-teacher`);
    return response.data;
};

/**
 * Скачать все дипломы ученика архивом (для учителя)
 */
export const downloadStudentDiplomas = async (studentId: number): Promise<Blob> => {
    const response = await api.get(`/results/student/${studentId}/zip`, {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Получить список заявок на конкурс (для модератора)
 */
export const fetchApplicationsForCompetition = async (competitionId: number): Promise<MyApplication[]> => {
    const response = await api.get(`/applications/competition/${competitionId}`);
    return response.data;
};