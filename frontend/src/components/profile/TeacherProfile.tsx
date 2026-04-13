import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { StudentCard } from './StudentCard';
import api from '../../api/client';

interface Student {
    id: number;
    fullName: string;
    birthDate: string;
    phone: string;
    email: string;
    city: string;
    organization: string;
    hasAccount: boolean;
}

export const TeacherProfile = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/profiles/students/my');
            setStudents(response.data);
        } catch (error) {
            console.error('Ошибка загрузки учеников:', error);
            toast.error('Не удалось загрузить список учеников');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    if (loading) {
        return <div className="text-center py-20">Загрузка...</div>;
    }

    return (
        <div className="max-w-[1200px] mx-auto font-normal">
            <Helmet>
                <title>Кабинет учителя | Платформа конкурсов</title>
            </Helmet>

            {/* КНОПКА СОЗДАНИЯ */}
            <div className="flex justify-center mb-12">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/create-student')} 
                    className="bg-brand-orange text-white px-12 py-4 rounded-2xl font-unbounded text-sm hover:opacity-90 transition-all uppercase tracking-wider font-normal active:scale-95"
                >
                    Создать профиль ученика
                </motion.button>
            </div>

            {/* СПИСОК УЧЕНИКОВ */}
            {students.length === 0 ? (
                <p className="text-center text-gray-500 py-20">У вас пока нет прикреплённых учеников</p>
            ) : (
                <div className="space-y-6">
                    {students.map((student) => (
                        <StudentCard 
                            key={student.id}
                            id={student.id}
                            fullName={student.fullName}
                            email={student.email}
                            phone={student.phone}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};