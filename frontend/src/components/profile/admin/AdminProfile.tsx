import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminRequests } from './AdminRequests'; // Импортируем готовый список заявок
import { AdminUsersList } from './AdminUsersList'; 

export const AdminProfile = () => {
  const [activeTab, setActiveTab] = useState('Заявки на регистрацию');

  return (
    <div className="w-full animate-fadeIn">
      {/* ТАБЫ */}
      <div className="relative w-full bg-brand-peach rounded-full p-1 flex mb-12 overflow-hidden max-w-[600px] mx-auto shadow-inner">
        {['Заявки на регистрацию', 'Пользователи'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 py-2 font-roboto text-base z-10 transition-colors duration-300 ${
              activeTab === tab ? 'text-white' : 'text-brand-orange'
            }`}
          >
            {activeTab === tab && (
              <motion.div 
                layoutId="admin-active-pill" 
                className="absolute inset-0 bg-brand-orange rounded-full" 
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-20">{tab}</span>
          </button>
        ))}
      </div>

      {/* КОНТЕНТ ВКЛАДОК */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Заявки на регистрацию' ? (
            /* Вызываем отдельный компонент заявок. 
               Там уже лежат данные в плоском формате (lastName, firstName, etc.)
            */
            <AdminRequests />
          ) : (
            /* Вызываем список пользователей. 
               Внутри него своя логика поиска и модалка удаления.
            */
            <AdminUsersList />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};