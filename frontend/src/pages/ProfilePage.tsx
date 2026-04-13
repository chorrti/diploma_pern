import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { StudentProfile } from '../components/profile/StudentProfile';
import { TeacherProfile } from '../components/profile/TeacherProfile';
import { ProfileInfo } from '../components/profile/ProfileInfo';
import { ConfirmModal } from '../components/ConfirmModal';

// Модератор
import { ModeratorContests } from '../components/profile/moderator/ModeratorContests';
import { ModeratorResults } from '../components/profile/moderator/ModeratorResults';
import { ModeratorExhibition } from '../components/profile/moderator/ModeratorExhibition';
import { ModeratorSettings } from '../components/profile/moderator/ModeratorSettings';

// АДМИН
import { AdminProfile } from '../components/profile/admin/AdminProfile';

// API
import { fetchMyProfile, fetchProfileById } from '../api/profile';
import type { ProfileData } from '../api/profile';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const [searchParams] = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Состояние для данных профиля
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для просмотра ученика учителем
  const studentId = searchParams.get('studentId');
  const isViewingAsTeacher = searchParams.get('viewAs') === 'teacher';
  const isViewingStudent = isViewingAsTeacher && studentId;
  const [viewedStudent, setViewedStudent] = useState<ProfileData | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Загружаем данные ученика, если учитель смотрит профиль ученика
  useEffect(() => {
    if (isViewingStudent && studentId) {
      const loadStudent = async () => {
        setLoadingStudent(true);
        try {
          const data = await fetchProfileById(parseInt(studentId));
          setViewedStudent(data);
        } catch (err) {
          console.error('Ошибка загрузки ученика:', err);
          toast.error('Не удалось загрузить данные ученика');
        } finally {
          setLoadingStudent(false);
        }
      };
      loadStudent();
    }
  }, [isViewingStudent, studentId]);

  // Загружаем реальные данные профиля (своего)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchMyProfile();
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError('Не удалось загрузить данные профиля');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Данные для отображения (свои или просматриваемого ученика)
  const displayProfile = isViewingStudent ? viewedStudent : profile;
  const displayLoading = isViewingStudent ? loadingStudent : loading;

  // Подготовка данных для ProfileInfo
  const userData = displayProfile ? {
    fio: displayProfile.fullName,
    birthDate: displayProfile.birthDate,
    city: displayProfile.city,
    email: displayProfile.email,
    phone: displayProfile.phone,
    organization: displayProfile.organization
  } : {
    fio: "",
    birthDate: "",
    city: "",
    email: "",
    phone: "",
    organization: ""
  };

  const [activeModTab, setActiveModTab] = useState('Конкурсы');
  const modTabs = ['Конкурсы', 'Результаты', 'Выставка', 'Степени и Тематики'];

  const getRoleLabel = () => {
    if (isViewingAsTeacher) return 'просмотр ученика';
    if (!displayProfile) return 'загрузка...';
    if (displayProfile.role === 'Админ') return 'админ';
    if (displayProfile.role === 'Модератор') return 'модератор';
    if (displayProfile.role === 'Учитель') return 'учитель';
    return 'ученик';
  };

  // Показываем загрузку
  if (displayLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10 text-center">
        <Helmet>
          <title>Личный кабинет | Платформа конкурсов</title>
        </Helmet>
        <p className="font-roboto text-brand-dark-teal text-lg">Загрузка профиля...</p>
      </div>
    );
  }

  // Показываем ошибку
  if (error || !displayProfile) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10 text-center">
        <Helmet>
          <title>Личный кабинет | Платформа конкурсов</title>
        </Helmet>
        <p className="font-roboto text-brand-orange text-lg">{error || 'Профиль не найден'}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 border border-brand-dark-teal text-brand-dark-teal px-6 py-2 rounded-xl hover:bg-brand-dark-teal hover:text-white transition-all"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  // Определяем, что показывать в зависимости от роли просматриваемого профиля
  const renderContent = () => {
    // Если учитель смотрит ученика — показываем StudentProfile с передачей studentId
    if (isViewingStudent) {
      return <StudentProfile studentId={parseInt(studentId!)} />;
    }
    
    // Иначе показываем в зависимости от роли профиля
    if (displayProfile.role === 'Админ') {
      return <AdminProfile />;
    }
    
    if (displayProfile.role === 'Модератор') {
      return (
        <>
          <div className="relative w-full bg-brand-peach rounded-full p-1 flex mb-12 overflow-hidden max-w-[900px] mx-auto shadow-sm">
            {modTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveModTab(tab)}
                className={`relative flex-1 py-3 font-roboto text-lg z-10 transition-colors duration-300 ${activeModTab === tab ? 'text-white' : 'text-brand-orange'}`}
              >
                {activeModTab === tab && <motion.div layoutId="mod-pill" className="absolute inset-0 bg-brand-orange rounded-full" />}
                <span className="relative z-20">{tab}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeModTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeModTab === 'Конкурсы' && <ModeratorContests />}
              {activeModTab === 'Результаты' && <ModeratorResults />}
              {activeModTab === 'Выставка' && <ModeratorExhibition />} 
              {activeModTab === 'Степени и Тематики' && <ModeratorSettings />}
            </motion.div>
          </AnimatePresence>
        </>
      );
    }
    
    if (displayProfile.role === 'Учитель' && !isViewingAsTeacher) {
      return <TeacherProfile />;
    }
    
    return <StudentProfile />;
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn min-h-screen font-normal">
      <Helmet>
        <title>Личный кабинет | Платформа конкурсов</title>
      </Helmet>

      {/* ШАПКА */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <h1 className="font-unbounded text-brand-dark-teal text-4xl uppercase">
          Личный кабинет <span className="text-brand-orange text-xl ml-2 tracking-tighter">[{getRoleLabel()}]</span>
        </h1>
        {!isViewingStudent && (
          <button onClick={onLogout} className="border border-brand-dark-teal text-brand-dark-teal px-10 py-3 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all">
            Выйти из профиля
          </button>
        )}
        {isViewingStudent && (
          <button 
            onClick={() => window.history.back()}
            className="border border-brand-dark-teal text-brand-dark-teal px-10 py-3 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all"
          >
            Назад
          </button>
        )}
      </div>

      <ProfileInfo data={userData} />

      {/* КОНТЕНТ В ЗАВИСИМОСТИ ОТ РОЛИ */}
      {renderContent()}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => window.history.back()}
        title={`Вы уверены, что хотите\nудалить профиль ученика?`}
      />
    </div>
  );
};