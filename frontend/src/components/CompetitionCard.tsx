import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface CardProps {
  id: number;
  title: string;
  start: string;
  end: string;
  results: string;
  desc: string;
  status: 'active' | 'finished';
  regulationUrl?: string;
  userRole?: string | null;  // ← добавляем роль пользователя
}

export const CompetitionCard = ({ 
  id,
  title, 
  start, 
  end, 
  results, 
  desc, 
  status, 
  regulationUrl,
  userRole
}: CardProps) => {
  const navigate = useNavigate();
  const isFinished = status === 'finished';

  const canApply = () => {
    if (!userRole) return false;
    return userRole === 'Ученик' || userRole === 'Учитель';
  };

const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userRole) {
      toast.error('Для подачи заявки необходимо войти в систему');
      return;
    }
    
    if (!canApply()) {
      toast.error('Вы не можете подать заявку. Нужна роль "Ученик" или "Учитель"');
      return;
    }
    
    // ← ДОЛЖЕН БЫТЬ ПАРАМЕТР action=apply
    const params = new URLSearchParams();
    params.append('id', id.toString());
    params.append('action', 'apply');
    navigate(`/contest?${params.toString()}`);
};

  const handleNavigate = (action?: 'results') => {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    
    if (isFinished) {
      params.append('status', 'finished');
      if (action === 'results') params.append('action', 'results');
    }

    navigate(`/contest?${params.toString()}`);
  };

  const handleRegulationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (regulationUrl) {
      window.open(regulationUrl, '_blank');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-[40px] p-10 border transition-all ${
        isFinished 
          ? 'bg-[#FFF2F0] border-brand-orange shadow-[0_6px_0_0_#F07D58]' 
          : 'bg-brand-light-teal border-brand-accent-teal shadow-[0_6px_0_0_#337D86]'
      }`}
    >
      <div className="flex justify-between gap-10">
        <div className="flex-1 cursor-pointer" onClick={() => handleNavigate()}>
          <h3 className={`font-unbounded text-2xl mb-6 leading-tight font-normal ${
            isFinished ? 'text-brand-red-dark' : 'text-brand-dark-teal'
          }`}>
            {title}
          </h3>
          <div className={`space-y-2 font-unbounded text-sm font-normal ${
            isFinished ? 'text-brand-red-dark' : 'text-brand-dark-teal'
          }`}>
            <p>Начало: {start}</p>
            <p>Конец: {end}</p>
            <p>Результаты: {results}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-[300px]">
          <button 
            onClick={isFinished ? () => handleNavigate('results') : handleApplyClick}
            className={`w-full bg-transparent border py-3.5 rounded-xl font-roboto transition-all text-base tracking-wide font-normal ${
              isFinished 
                ? 'border-brand-red-dark text-brand-red-dark hover:bg-brand-red-dark hover:text-white' 
                : 'border-brand-dark-teal text-brand-dark-teal hover:bg-brand-dark-teal hover:text-white'
            }`}
          >
            {isFinished ? 'Результаты' : 'Подать заявку'}
          </button>
          
          <button 
            onClick={handleRegulationClick}
            className={`w-full bg-transparent border py-3.5 rounded-xl font-roboto transition-all text-base tracking-wide font-normal ${
              isFinished 
                ? 'border-brand-red-dark text-brand-red-dark hover:bg-brand-red-dark hover:text-white' 
                : 'border-brand-dark-teal text-brand-dark-teal hover:bg-brand-dark-teal hover:text-white'
            }`}
          >
            Положение
          </button>
        </div>
      </div>

      <div 
        onClick={() => handleNavigate()}
        className={`mt-6 pt-6 border-t cursor-pointer ${isFinished ? 'border-brand-orange/30' : 'border-brand-dark-teal/20'}`}
      >
        <p className={`text-sm font-roboto opacity-70 overflow-hidden font-normal ${
          isFinished ? 'text-brand-red-dark' : 'text-brand-dark-teal'
        }`}
        style={{ display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis' }}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
};