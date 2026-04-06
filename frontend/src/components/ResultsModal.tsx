import { motion, AnimatePresence } from 'framer-motion';

interface Winner {
  id: number;
  fullName: string;
  diplomaLink: string;
  degree: string;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestTitle: string;
}

export const ResultsModal = ({ isOpen, onClose, contestTitle }: ResultsModalProps) => {
  const winners: Winner[] = [
    { id: 1, fullName: "Бальджинимаева Валерия Зориктуевна", diplomaLink: "#", degree: "лауреат I степени" },
    { id: 2, fullName: "Иванов Иван Иванович", diplomaLink: "#", degree: "дипломант II степени" },
    { id: 3, fullName: "Петров Петр Петрович", diplomaLink: "#", degree: "лауреат III степени" },
        { id: 1, fullName: "Бальджинимаева Валерия Зориктуевна", diplomaLink: "#", degree: "лауреат I степени" },
    { id: 2, fullName: "Иванов Иван Иванович", diplomaLink: "#", degree: "дипломант II степени" },
    { id: 3, fullName: "Петров Петр Петрович", diplomaLink: "#", degree: "лауреат III степени" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-white w-full max-w-[1100px] max-h-[90vh] flex flex-col p-8 md:p-12 rounded-[40px] shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-[#F07D58] text-white rounded-xl flex items-center justify-center font-unbounded text-xl hover:bg-opacity-90 transition-all z-10 font-normal"
            >
              X
            </button>

            <h2 className="font-unbounded text-brand-dark-teal text-xl md:text-2xl mb-6 pr-14 leading-tight font-normal">
              {contestTitle}
            </h2>

            {/* Исправленный контейнер прокрутки */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4 -mx-2 -my-4">
              {/* px-2 py-4 — даем место теням и анимации y-2
                  -mx-2 -my-4 — компенсируем отступы отрицательными маржинами, 
                  чтобы визуально список остался на месте
              */}
              <div className="space-y-6"> 
                {winners.map((winner) => (
                  <div 
                    key={winner.id}
                    className="bg-brand-light-teal border border-brand-accent-teal rounded-[30px] p-6 md:p-8 shadow-[0_4px_0_0_#337D86] transition-all hover:translate-y-[-4px] active:translate-y-[0px]"
                  >
                    <div className="w-full mb-4">
                      <p className="font-unbounded text-brand-dark-teal text-lg font-normal leading-tight">
                        {winner.fullName}
                      </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <a 
                        href={winner.diplomaLink}
                        className="font-unbounded text-brand-accent-teal text-sm border-b border-brand-accent-teal hover:opacity-70 transition-opacity font-normal"
                      >
                        Ссылка на файл диплома
                      </a>
                      <p className="font-unbounded text-brand-dark-teal text-sm font-normal">
                        Степень диплома: <span className="opacity-70">{winner.degree}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};