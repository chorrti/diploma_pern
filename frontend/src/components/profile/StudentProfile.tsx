import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MySubmissionModal } from '../MySubmissionModal';
import { ProfileContestCard } from './ProfileContestCard';
import { fetchMyApplications, fetchMyDiplomas, fetchApplicationDetails, fetchApplicationsByStudentId, fetchDiplomasByStudentId, fetchApplicationDetailsForTeacher } from '../../api/applications';
import type { ApplicationDetails } from '../../api/applications';
import { toast } from 'react-hot-toast';
import api from '../../api/client';

interface StudentProfileProps {
  studentId?: number;
}

export const StudentProfile = ({ studentId }: StudentProfileProps) => {
  const [activeTab, setActiveTab] = useState('Участие в конкурсах');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetails | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [participations, setParticipations] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState({ participations: true, portfolio: true });

  // Загружаем заявки
  useEffect(() => {
    const loadParticipations = async () => {
      try {
        let data;
        if (studentId) {
          data = await fetchApplicationsByStudentId(studentId);
        } else {
          data = await fetchMyApplications();
        }
        setParticipations(data);
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        toast.error('Не удалось загрузить заявки');
      } finally {
        setLoading(prev => ({ ...prev, participations: false }));
      }
    };
    loadParticipations();
  }, [studentId]);

  // Загружаем дипломы
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        let data;
        if (studentId) {
          data = await fetchDiplomasByStudentId(studentId);
        } else {
          data = await fetchMyDiplomas();
        }
        setPortfolio(data);
      } catch (error) {
        console.error('Ошибка загрузки дипломов:', error);
        toast.error('Не удалось загрузить дипломы');
      } finally {
        setLoading(prev => ({ ...prev, portfolio: false }));
      }
    };
    loadPortfolio();
  }, [studentId]);

  const handleOpenSubmission = async (applicationId: number) => {
    try {
      let details;
      if (studentId) {
        details = await fetchApplicationDetailsForTeacher(applicationId);
      } else {
        details = await fetchApplicationDetails(applicationId);
      }
      setSelectedApplication(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка загрузки деталей заявки:', error);
      toast.error('Не удалось загрузить данные заявки');
    }
  };

  const handleDownloadDiploma = (diplomaUrl: string) => {
    if (diplomaUrl) {
      window.open(diplomaUrl, '_blank');
    }
  };

  // Скачивание всех дипломов (для своего профиля или для ученика)
  const handleDownloadAllDiplomas = async () => {
    setIsDownloading(true);
    try {
      let response;
      if (studentId) {
        // Скачиваем дипломы ученика
        response = await api.get(`/results/student/${studentId}/zip`, {
          responseType: 'blob'
        });
      } else {
        // Скачиваем свои дипломы
        response = await api.get('/results/my/zip', {
          responseType: 'blob'
        });
      }
      
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

  const renderParticipations = () => {
    if (loading.participations) {
      return <p className="text-center text-gray-500 py-10">Загрузка...</p>;
    }
    
    if (participations.length === 0) {
      return <p className="text-center text-gray-500 py-10">Заявок пока нет</p>;
    }
    
    return participations.map(item => (
      <ProfileContestCard
        key={item.id}
        id={item.contest.id}
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
      return <p className="text-center text-gray-500 py-10">Дипломов пока нет</p>;
    }
    
    return portfolio.map(item => (
      <ProfileContestCard
        key={item.id}
        id={item.contest.id}
        variant="portfolio"
        title={item.contest.name}
        start={item.contest.startDate}
        end={item.contest.endDate}
        results={item.contest.resultsDate}
        desc={item.contest.description}
        diploma={item.degree}
        onDownloadDiploma={() => handleDownloadDiploma(item.diplomaUrl)}
      />
    ));
  };

  // Показываем кнопку "Скачать все дипломы", если есть дипломы
  const showDownloadAllButton = portfolio.length > 0;

  return (
    <div className="max-w-[1200px] mx-auto font-normal">
      <Helmet>
        <title>Личный кабинет ученика | Платформа конкурсов</title>
      </Helmet>

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

      {activeTab === 'Портфолио' && showDownloadAllButton && (
        <div className="flex justify-center mb-10">
          <button
            onClick={handleDownloadAllDiplomas}
            disabled={isDownloading}
            className="w-full max-w-[400px] bg-brand-accent-teal text-white py-4 rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-md"
          >
            {isDownloading 
              ? 'Подготовка архива...' 
              : studentId 
                ? 'Скачать все дипломы ученика (ZIP)' 
                : 'Скачать все дипломы (ZIP)'
            }
          </button>
        </div>
      )}

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