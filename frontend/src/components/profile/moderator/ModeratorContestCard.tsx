import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ModeratorContestCardProps {
  id: number;
  title: string;
  start: string;
  end: string;
  results: string;
  desc: string;
  isResults?: boolean;
  onComplete?: () => void;
  onAction1?: () => void;
  onAction2?: () => void;
}

export const ModeratorContestCard = ({
  id,
  title,
  start,
  end,
  results,
  desc,
  isResults = false,
  onComplete,
  onAction1,
  onAction2
}: ModeratorContestCardProps) => {
  
  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (action) action();
  };

  return (
    <Link to={`/contest?id=${id}`} className="block mb-8">
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-brand-light-teal border border-brand-accent-teal rounded-[40px] p-10 md:p-12 shadow-[0_6px_0_0_#337D86] transition-all"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="flex-1 w-full">
            <h3 className="font-unbounded text-2xl text-brand-dark-teal mb-6 leading-tight font-normal">
              {title}
            </h3>
            <div className="space-y-2 font-unbounded text-sm text-brand-dark-teal font-normal opacity-90">
              <p>Начало: {start}</p>
              <p>Конец: {end}</p>
              <p>Результаты: {results}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            {/* Для вкладки "Конкурсы" — кнопка "Завершить конкурс" */}
            {!isResults && onComplete && (
              <button 
                onClick={(e) => handleAction(e, onComplete)}
                className="border border-brand-dark-teal text-brand-dark-teal px-8 py-3.5 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all text-base whitespace-nowrap active:scale-95 text-center"
              >
                Завершить конкурс
              </button>
            )}
            
            {/* Для вкладки "Результаты" — кнопки компиляции и публикации */}
            {isResults && (
              <>
                <button 
                  onClick={(e) => handleAction(e, onAction1)}
                  className="border border-brand-dark-teal text-brand-dark-teal px-8 py-3.5 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all text-base whitespace-nowrap active:scale-95 text-center"
                >
                  Компиляция для жюри
                </button>
                {onAction2 && (
                  <button 
                    onClick={(e) => handleAction(e, onAction2)}
                    className="border border-brand-dark-teal text-brand-dark-teal px-8 py-3.5 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all text-base whitespace-nowrap active:scale-95 text-center"
                  >
                    Опубликовать результаты
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-brand-dark-teal/20">
          <p className={`text-sm font-roboto text-brand-dark-teal opacity-70 overflow-hidden font-normal`}
             style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis' }}>
            {desc}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};