import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { StudentProfile } from '../components/profile/StudentProfile';
import { TeacherProfile } from '../components/profile/TeacherProfile';
import { ProfileInfo } from '../components/profile/ProfileInfo';
import { ConfirmModal } from '../components/ConfirmModal';

// Модератор
import { ModeratorContests } from '../components/profile/moderator/ModeratorContests';
import { ModeratorResults } from '../components/profile/moderator/ModeratorResults';
import { ModeratorExhibition } from '../components/profile/moderator/ModeratorExhibition';
import { ModeratorSettings } from '../components/profile/moderator/ModeratorSettings';

// АДМИН (Подключаем наш новый компонент)
import { AdminProfile } from '../components/profile/admin/AdminProfile';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const [searchParams] = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const role = searchParams.get('role') || 'student';
  const isViewingAsTeacher = searchParams.get('viewAs') === 'teacher';

  const isTeacher = role === 'teacher';
  const isModerator = role === 'moderator';
  const isAdmin = role === 'admin';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  const userData = {
    fio: "Иванов Иван Иванович",
    birthDate: "01.01.1985",
    city: "Самара",
    email: "user@school.ru",
    phone: "+7 (999) 123-45-67",
    organization: "МБОУ СОШ №1"
  };

  const [activeModTab, setActiveModTab] = useState('Конкурсы');
  const modTabs = ['Конкурсы', 'Результаты', 'Выставка', 'Степени и Тематики'];

  const getRoleLabel = () => {
    if (isViewingAsTeacher) return 'просмотр ученика';
    if (isAdmin) return 'админ';
    if (isTeacher) return 'учитель';
    if (isModerator) return 'модератор';
    return 'ученик';
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn min-h-screen font-normal">
      {/* ШАПКА */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <h1 className="font-unbounded text-brand-dark-teal text-4xl uppercase">
          Личный кабинет <span className="text-brand-orange text-xl ml-2 tracking-tighter">[{getRoleLabel()}]</span>
        </h1>
        <button onClick={onLogout} className="border border-brand-dark-teal text-brand-dark-teal px-10 py-3 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all">
          Выйти из профиля
        </button>
      </div>

      <ProfileInfo data={userData} />

      {/* ВЫБОР КОНТЕНТА ПО РОЛИ */}
      {isAdmin ? (
        <AdminProfile />
      ) : isModerator ? (
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
      ) : (
        isTeacher && !isViewingAsTeacher ? <TeacherProfile /> : <StudentProfile />
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => window.history.back()}
        title={`Вы уверены, что хотите\nудалить профиль ученика?`}
      />
    </div>
  );
};