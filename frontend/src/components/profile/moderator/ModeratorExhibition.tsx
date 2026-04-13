import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ModeratorExhibitionCard } from './ModeratorExhibitionCard';
import { MySubmissionModal } from '../../MySubmissionModal';
import { fetchModeratorExhibition, publishExhibitionWork, rejectExhibitionWork } from '../../../api/exhibition';
import { fetchApplicationDetailsForTeacher } from '../../../api/applications';
import type { ApplicationDetails } from '../../../api/applications';

export const ModeratorExhibition = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<ApplicationDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRequests = async () => {
    try {
      const data = await fetchModeratorExhibition();
      setRequests(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

const handleOpenModal = async (work: any) => {
    try {
        const details = await fetchApplicationDetailsForTeacher(work.applicationId);
        setSelectedWork(details);
        setIsModalOpen(true);
    } catch (error) {
        console.error('Ошибка загрузки деталей:', error);
        toast.error('Не удалось загрузить данные');
    }
};

  const handleApprove = async (id: number) => {
    try {
      await publishExhibitionWork(id);
      toast.success('Работа опубликована на выставке');
      loadRequests(); // Обновляем список
    } catch (error) {
      toast.error('Ошибка при публикации');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectExhibitionWork(id);
      toast.success('Заявка отклонена');
      loadRequests(); // Обновляем список
    } catch (error) {
      toast.error('Ошибка при отклонении');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="animate-fadeIn">
      {requests.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Нет заявок на рассмотрение</p>
      ) : (
        <div className="grid grid-cols-1">
          {requests.map((item) => (
            <ModeratorExhibitionCard 
              key={item.id}
              id={item.id}
              workTitle={item.workTitle}
              author={item.author}
              description={item.workDescription}
              contestTitle={item.contestTitle}
              onOpen={() => handleOpenModal(item)}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
            />
          ))}
        </div>
      )}

      <MySubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWork(null);
        }} 
        workDetails={selectedWork}
      />
    </div>
  );
};