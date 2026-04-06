import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MySubmissionModal } from '../MySubmissionModal';
import { ProfileContestCard } from './ProfileContestCard';

export const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('Участие в конкурсах');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Имитация данных (потом просто придут из props или fetch)
  const participations = [
    {
      id: 1,
      title: "КОНКУРС ПОД НАЗВАНИЕМ НАЗВАНИЕМ НАЗВАНИЕМ НАЗВАНИЕМ..................",
      start: "01.01.2025",
      end: "02.02.2025",
      results: "03.03.2025",
      desc: "During the initial consultation, we will discuss your business goals and objectives, target audience, and current marketing efforts."
    }
  ];

  const portfolio = [
    {
      id: 101,
      title: "АРХИВНЫЙ КОНКУРС ТАЛАНТОВ 2024",
      start: "01.09.2024",
      end: "01.10.2024",
      results: "15.10.2024",
      diploma: "Диплом I степени",
      desc: "Вы успешно прошли все этапы конкурса и заняли почетное место."
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto font-normal">
      {/* ТАБЫ */}
      <div className="relative w-full bg-brand-peach/30 rounded-full p-1 flex mb-12 max-w-[700px] mx-auto">
        {['Участие в конкурсах', 'Портфолио'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 py-3 font-roboto text-lg z-10 transition-colors ${
              activeTab === tab ? 'text-white' : 'text-brand-orange'
            }`}
          >
            {activeTab === tab && (
              <motion.div 
                layoutId="active-pill-profile" 
                className="absolute inset-0 bg-brand-orange rounded-full" 
                transition={{ type: "spring", stiffness: 400, damping: 35 }} 
              />
            )}
            <span className="relative z-20">{tab}</span>
          </button>
        ))}
      </div>

      {/* КОНТЕНТ */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Участие в конкурсах' ? (
              participations.map(item => (
                <ProfileContestCard 
                  key={item.id}
                  variant="participation"
                  {...item}
                  onOpenSubmission={() => setIsModalOpen(true)}
                />
              ))
            ) : (
              portfolio.map(item => (
                <ProfileContestCard 
                  key={item.id}
                  variant="portfolio"
                  {...item}
                  onOpenSubmission={() => {}}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <MySubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};