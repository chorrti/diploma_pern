import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MySubmissionModal } from '../MySubmissionModal';
import { ProfileContestCard } from './ProfileContestCard';
import { fetchMyApplications, fetchMyDiplomas, fetchApplicationDetails } from '../../api/applications';
import type { MyApplication, MyDiploma, ApplicationDetails } from '../../api/applications';
import { toast } from 'react-hot-toast';
import api from '../../api/client';

export const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('Участие в конкурсах');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetails | null>(null);
  
  const [participations, setParticipations] = useState<MyApplication[]>([]);
  const [portfolio, setPortfolio] = useState<MyDiploma[]>([]);
  const [loading, setLoading] = useState({ participations: true, portfolio: true });

  const [isDownloading, setIsDownloading] = useState(false);

  // Загружаем заявки
  useEffect(() => {
    const loadParticipations = async () => {
      try {
        const data = await fetchMyApplications();
        setParticipations(data);
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        toast.error('Не удалось загрузить заявки');
      } finally {
        setLoading(prev => ({ ...prev, participations: false }));
      }
    };
    loadParticipations();
  }, []);

  // Загружаем дипломы
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const data = await fetchMyDiplomas();
        setPortfolio(data);
      } catch (error) {
        console.error('Ошибка загрузки дипломов:', error);
        toast.error('Не удалось загрузить дипломы');
      } finally {
        setLoading(prev => ({ ...prev, portfolio: false }));
      }
    };
    loadPortfolio();
  }, []);

  // Открытие модалки с деталями заявки
  const handleOpenSubmission = async (applicationId: number) => {
    try {
      const details = await fetchApplicationDetails(applicationId);
      setSelectedApplication(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка загрузки деталей заявки:', error);
      toast.error('Не удалось загрузить данные заявки');
    }
  };

  //скачивание всех дипломов
const handleDownloadAllDiplomas = async () => {
    setIsDownloading(true);
    try {
        const response = await api.get('/results/my/zip', {
            responseType: 'blob'
        });
        
        // Создаём ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `diplomas_${Date.now()}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Архив с дипломами скачан');
    } catch (error) {
        console.error('Ошибка скачивания архива:', error);
        toast.error('Не удалось скачать архив');
    } finally {
        setIsDownloading(false);
    }
};

  // Скачивание диплома
  const handleDownloadDiploma = (diplomaUrl: string) => {
    if (diplomaUrl) {
      window.open(diplomaUrl, '_blank');
    }
  };

  const renderParticipations = () => {
    if (loading.participations) {
      return <p className="text-center text-gray-500 py-10">Загрузка...</p>;
    }
    
    if (participations.length === 0) {
      return <p className="text-center text-gray-500 py-10">Вы ещё не подали ни одной заявки</p>;
    }
    
    return participations.map(item => (
      <ProfileContestCard
        key={item.id}
        id={item.contest.id}  // ← добавляем id конкурса
        variant="participation"
        title={item.contest.name}
        start={item.contest.startDate}
        end={item.contest.endDate}
        results={item.contest.resultsDate}
        desc={item.contest.description}
        onOpenSubmission={() => handleOpenSubmission(item.id)}
      />
    ));
  };

const renderPortfolio = () => {
    if (loading.portfolio) {
      return <p className="text-center text-gray-500 py-10">Загрузка...</p>;
    }
    
    if (portfolio.length === 0) {
      return <p className="text-center text-gray-500 py-10">У вас пока нет дипломов</p>;
    }
    
    return portfolio.map(item => (
      <ProfileContestCard
        key={item.id}
        id={item.contest.id}  // ← добавляем id конкурса
        variant="portfolio"
        title={item.contest.name}
        start={item.contest.startDate}
        end={item.contest.endDate}
        results={item.contest.resultsDate}
        desc={item.contest.description}
        diploma={item.degree}
        onOpenSubmission={() => handleDownloadDiploma(item.diplomaUrl)}
      />
    ));
  };

  return (
    <div className="max-w-[1200px] mx-auto font-normal">
      <Helmet>
        <title>Личный кабинет ученика | Платформа конкурсов</title>
      </Helmet>

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

        {activeTab === 'Портфолио' && portfolio.length > 0 && (
            <div className="flex justify-center mb-10">
                <button
                    onClick={handleDownloadAllDiplomas}
                    disabled={isDownloading}
                    className="w-full max-w-[400px] bg-brand-accent-teal text-white py-4 rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-md"
                >
                    {isDownloading ? 'Подготовка архива...' : 'Скачать все дипломы (ZIP)'}
                </button>
            </div>
        )}


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
            {activeTab === 'Участие в конкурсах' ? renderParticipations() : renderPortfolio()}
          </motion.div>
        </AnimatePresence>
      </div>

      <MySubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }} 
        workDetails={selectedApplication}
      />
    </div>
  );
};