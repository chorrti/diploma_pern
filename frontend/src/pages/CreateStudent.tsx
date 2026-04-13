import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import api from '../api/client';

export const CreateStudent = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        surname: '',
        name: '',
        patronymic: '',
        birthDate: '',
        phone: '',
        city: '',
        organization: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateForDB = (dateStr: string) => {
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        const runs = [{ len: 2, char: '.' }, { len: 4, char: '.' }];
        let formattedValue = '';
        let lastIndex = 0;
        runs.forEach((run) => {
            if (value.length > run.len) {
                formattedValue += value.slice(lastIndex, run.len) + run.char;
                lastIndex = run.len;
            }
        });
        formattedValue += value.slice(lastIndex);
        setFormData({ ...formData, birthDate: formattedValue });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('7') || value.startsWith('8')) value = value.slice(1);
        if (value.length > 10) value = value.slice(0, 10);
        let formattedValue = '+7 ';
        if (value.length > 0) formattedValue += '(' + value.slice(0, 3);
        if (value.length > 3) formattedValue += ') ' + value.slice(3, 6);
        if (value.length > 6) formattedValue += '-' + value.slice(6, 8);
        if (value.length > 8) formattedValue += '-' + value.slice(8, 10);
        setFormData({ ...formData, phone: formattedValue });
    };

    const validate = () => {
        const required = ['surname', 'name', 'birthDate', 'phone', 'city', 'organization'];
        for (const field of required) {
            if (!formData[field as keyof typeof formData]?.trim()) {
                return `Заполните поле "${field === 'surname' ? 'Фамилия' : field === 'name' ? 'Имя' : field === 'birthDate' ? 'Дата рождения' : field === 'phone' ? 'Телефон' : field === 'city' ? 'Город' : 'Организация'}"`;
            }
        }
        if (formData.phone.length < 18) return "Введите полный номер телефона";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validate();
        if (err) return toast.error(err);

        setIsSubmitting(true);

        try {
            await api.post('/profiles/students', {
                familia: formData.surname,
                name: formData.name,
                otchestvo: formData.patronymic,
                birthDate: formatDateForDB(formData.birthDate),
                phone: formData.phone,
                city: formData.city,
                organization: formData.organization
            });

            toast.success('Профиль ученика успешно создан!');
            setTimeout(() => navigate('/profile?role=teacher'), 2000);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка при создании профиля');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn">
            <Helmet>
                <title>Создание ученика | Платформа конкурсов</title>
            </Helmet>

            <Toaster />

            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={handleSubmit} noValidate>
                {/* Левая колонка */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Фамилия</label>
                        <input type="text" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Имя</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Отчество</label>
                        <input type="text" value={formData.patronymic} onChange={(e) => setFormData({...formData, patronymic: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>
                </div>

                {/* Правая колонка */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Дата рождения</label>
                        <input type="text" placeholder="ДД.ММ.ГГГГ" value={formData.birthDate} onChange={handleDateChange} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Телефон</label>
                        <input type="tel" placeholder="+7 (XXX) XXX-XX-XX" value={formData.phone} onChange={handlePhoneChange} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Город</label>
                        <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="font-roboto text-brand-dark-teal text-lg ml-1">Организация</label>
                        <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
                    </div>

                    <div className="pt-9">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-[#3D828A] text-white px-10 py-4 rounded-2xl font-roboto text-lg hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Создание...' : 'Создать профиль ученика'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};