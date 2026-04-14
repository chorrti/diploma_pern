import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ModeratorContestCard } from './ModeratorContestCard';
import { PublishResultsModal } from './PublishResultsModal';
import { fetchCompetitions } from '../../../api/contests';
import { downloadCompetitionExport } from '../../../api/export';
import type { Competition } from '../../../api/contests';
import { formatDate } from '../../../utils/formatDate';

export const ModeratorResults = () => {
  const [contests, setContests] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<{ id: number; name: string } | null>(null);

  const loadContests = async () => {
    try {
      const data = await fetchCompetitions('closed');
      setContests(data);
    } catch (error) {
      console.error('Ошибка загрузки конкурсов:', error);
      toast.error('Не удалось загрузить конкурсы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

const handleCompilation = async (id: number, name: string) => {
    try {
        await downloadCompetitionExport(id, name);
        toast.success('Файл успешно скачан');
    } catch (error) {
        console.error('Ошибка выгрузки:', error);
        toast.error('Не удалось выгрузить файл');
    }
};

  const handleOpenPublish = (id: number, name: string) => {
    setSelectedContest({ id, name });
    setIsPublishModalOpen(true);
  };

  const handlePublishSuccess = () => {
    // Обновляем список конкурсов (убираем опубликованный)
    loadContests();
  };

  if (loading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="animate-fadeIn">
      {contests.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Нет завершённых конкурсов</p>
      ) : (
        <div className="grid grid-cols-1">
          {contests.map((contest) => (
            <ModeratorContestCard 
              key={contest.id}
              id={contest.id}
              title={contest.name}
              start={formatDate(contest.startDate)}
              end={formatDate(contest.endDate)}
              results={formatDate(contest.resultsDate)}
              desc={contest.description}
              isResults={true}
              onAction1={() => handleCompilation(contest.id, contest.name)}
              onAction2={() => handleOpenPublish(contest.id, contest.name)}
            />
          ))}
        </div>
      )}

      <PublishResultsModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        contestId={selectedContest?.id || 0}
        contestTitle={selectedContest?.name || ''}
        onSuccess={handlePublishSuccess}
      />
    </div>
  );
};