import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  title: string;
  start: string;
  end: string;
  results: string;
  desc: string;
  status: 'active' | 'finished'; // Только два четких состояния
  regulationUrl?: string; // + добавляем ссылку на положение конкурса
}

export const CompetitionCard = ({ 
  title, start, end, results, desc, status, regulationUrl 
}: CardProps) => {
  const navigate = useNavigate();
  const isFinished = status === 'finished';

  const handleNavigate = (action?: 'apply' | 'results') => {
    const params = new URLSearchParams();
    
    if (isFinished) {
      params.append('status', 'finished');
      if (action === 'results') params.append('action', 'results');
    } else {
      if (action === 'apply') params.append('action', 'apply');
    }

    const queryString = params.toString();
    navigate(`/contest${queryString ? `?${queryString}` : ''}`);
  };

  // Обработчик клика по кнопке "Положение"
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
          {/* КНОПКА: Меняется текст, цвет и действие */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate(isFinished ? 'results' : 'apply');
            }}
            className={`w-full bg-transparent border py-3.5 rounded-xl font-roboto transition-all text-base tracking-wide font-normal ${
              isFinished 
                ? 'border-brand-red-dark text-brand-red-dark hover:bg-brand-red-dark hover:text-white' 
                : 'border-brand-dark-teal text-brand-dark-teal hover:bg-brand-dark-teal hover:text-white'
            }`}
          >
            {isFinished ? 'Результаты' : 'Подать заявку'}
          </button>
          
          {/* Кнопка "Положение" с реальной ссылкой */}
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