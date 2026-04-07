import { motion, AnimatePresence } from 'framer-motion';

interface MySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isModerator?: boolean;
}

export const MySubmissionModal = ({ isOpen, onClose, isModerator }: MySubmissionModalProps) => {
  const data = {
    title: "Название работы",
    description: "Описание работы ученика, которое он ввел при подаче заявки. Тут может быть длинный текст о концепции и процессе создания.",
    link: "https://disk.yandex.ru/d/example-link", 
    author: "Иванов Иван",
    organization: "Школа №1",
    city: "Самара",
    boss: "Петров П.П."
  };

  const handleRemoveFromExhibition = () => {
    // Логика удаления (например, вызов API)
    console.log("Работа удалена с выставки модератором");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="relative bg-white rounded-[40px] w-full max-w-[1000px] p-12 shadow-2xl overflow-y-auto max-h-[90vh] z-10"
          >
            {/* Кнопка закрытия */}
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center text-xl hover:scale-105 transition-all active:scale-95 shadow-lg"
            >
              ✕
            </button>

            <div className="flex flex-col items-center space-y-8">
              {/* Заголовок */}
              <h2 className="font-unbounded text-3xl text-brand-dark-teal uppercase text-center px-10">
                {data.title}
              </h2>

              {/* Описание */}
              <p className="font-roboto text-xl text-brand-dark-teal opacity-80 w-full text-left leading-relaxed">
                {data.description}
              </p>

              {/* Превью работы */}
              <div className="w-full aspect-video bg-[#D9D9D9] rounded-[30px] shadow-inner" />

              {/* Поле с ссылкой */}
              {data.link && (
                <div className="w-full text-left">
                  <span className="font-roboto text-lg opacity-60 block mb-1">Ссылка на материалы:</span>
                  <a 
                    href={data.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-roboto text-xl text-brand-dark-teal underline hover:text-brand-orange transition-colors break-all"
                  >
                    {data.link}
                  </a>
                </div>
              )}

              {/* Инфо-блок автора */}
              <div className="w-full pt-8 border-t border-brand-dark-teal/10 space-y-6">
                <p className="font-unbounded text-2xl text-brand-dark-teal">
                  Автор: <span className="font-normal opacity-70 uppercase">{data.author}</span>
                </p>
                
                <div className="flex justify-between items-center font-roboto text-xl text-brand-dark-teal opacity-60">
                  <span className="italic">{data.organization}</span>
                  <span className="font-unbounded text-lg uppercase">{data.city}</span>
                </div>

                <p className="font-unbounded text-2xl text-brand-dark-teal">
                  Руководитель: <span className="font-normal opacity-70 uppercase">{data.boss}</span>
                </p>
              </div>

              {/* Кнопка для модератора — появится только если в URL есть ?role=moderator */}
              {isModerator && (
                <div className="w-full pt-4">
                  <button
                    onClick={handleRemoveFromExhibition}
                    className="w-full py-5 border-2 border-brand-red-dark text-brand-red-dark rounded-2xl font-unbounded text-lg hover:bg-brand-red-dark hover:text-white transition-all active:scale-[0.98] uppercase tracking-wider"
                  >
                    Убрать с выставки
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};