import api from './client';

export interface Student {
    id: number;
    fullName: string;
    birthDate: string;
    phone: string;
    email: string;
    city: string;
    organization: string;
    familia: string;
    name: string;
    otchestvo: string;
}

/**
 * Получить список учеников текущего учителя
 */
export const fetchMyStudents = async (): Promise<Student[]> => {
    const response = await api.get('/profiles/students/my');
    return response.data;
};

/**
 * Получить данные конкретного ученика
 */
export const fetchStudentById = async (studentId: number): Promise<Student> => {
    const response = await api.get(`/profiles/student/${studentId}`);
    return response.data;
};