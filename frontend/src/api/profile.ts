import api from './client';

export interface ProfileData {
    id: number;
    fullName: string;
    birthDate: string;
    city: string;
    email: string;
    phone: string;
    organization: string;
    role: string;
}

export const fetchMyProfile = async (): Promise<ProfileData> => {
    const response = await api.get('/profiles/me');
    return response.data;
};