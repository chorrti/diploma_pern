import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ModeratorContestCard } from './ModeratorContestCard';
import { fetchCompetitions, updateCompetitionStatus } from '../../../api/contests';
import type { Competition } from '../../../api/contests';
import { formatDate, getFileUrl } from '../../../utils/formatDate';

export const ModeratorContests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContests = async () => {
    try {
      const data = await fetchCompetitions('open');
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

  const handleComplete = async (id: number) => {
    try {
      await updateCompetitionStatus(id, 'closed');
      toast.success('Конкурс завершён');
      // Удаляем завершённый конкурс из списка
      setContests(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Ошибка завершения конкурса:', error);
      toast.error('Не удалось завершить конкурс');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-center mb-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/contest/edit')}
          className="bg-brand-accent-teal text-white px-12 py-4 rounded-2xl font-unbounded text-sm hover:opacity-90 transition-all uppercase tracking-wider font-normal shadow-[0_6px_0_0_#337D86] active:translate-y-[2px] active:shadow-none"
        >
          Создать новый конкурс
        </motion.button>
      </div>

      {contests.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Нет активных конкурсов</p>
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
              isResults={false}
              onComplete={() => handleComplete(contest.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};