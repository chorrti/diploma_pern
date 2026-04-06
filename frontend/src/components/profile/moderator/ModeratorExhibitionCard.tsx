import { motion } from 'framer-motion';

interface ModeratorExhibitionCardProps {
  workTitle: string;
  author: string;
  description: string;
  contestTitle: string;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const ModeratorExhibitionCard = ({
  workTitle, author, description, contestTitle, onOpen, onApprove, onReject
}: ModeratorExhibitionCardProps) => {
  
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Чтобы не открывалось модальное окно при клике на кнопки
    action();
  };

  return (
    <motion.div 
      onClick={onOpen}
      whileHover={{ y: -5 }}
      className="bg-brand-light-teal border border-brand-accent-teal rounded-[40px] p-10 md:p-12 mb-8 shadow-[0_6px_0_0_#337D86] cursor-pointer"
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
        <div className="flex-1 w-full">
          <h3 className="font-unbounded text-2xl text-brand-dark-teal mb-4 leading-tight font-normal">
            {workTitle}
          </h3>
          <p className="text-sm font-roboto text-brand-dark-teal opacity-70 leading-relaxed font-normal line-clamp-3">
            {description}
          </p>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={(e) => handleAction(e, onApprove)}
            className="border border-brand-dark-teal text-brand-dark-teal px-8 py-3.5 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all text-base whitespace-nowrap active:scale-95 text-center"
          >
            Отправить на выставку
          </button>
          <button 
            onClick={(e) => handleAction(e, onReject)}
            className="border border-brand-dark-teal text-brand-dark-teal px-8 py-3.5 rounded-xl font-roboto hover:bg-brand-dark-teal hover:text-white transition-all text-base whitespace-nowrap active:scale-95 text-center"
          >
            Отклонить заявку
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-brand-dark-teal/20 space-y-4">
        <h4 className="font-unbounded text-2xl text-brand-dark-teal font-normal">
          ФИО автора работы (ученика)
        </h4>
        <p className="font-unbounded text-xl text-brand-dark-teal opacity-60">
          {author}
        </p>
        <div className="pt-4">
          <p className="font-roboto text-sm text-brand-dark-teal opacity-80 italic">
            {contestTitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
};