import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title }: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        /* Контейнер теперь фиксированный на весь экран */
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
          
          {/* Оверлей (фон с блюром) теперь fixed и за пределами основного контента модалки */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Сама модалка */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            /* Стили согласно твоим правкам: max-w-[650px], p-10/14 */
            className="relative bg-white w-full max-w-[650px] p-10 md:p-14 rounded-[40px] shadow-2xl border border-brand-dark-teal/5 flex flex-col items-center z-10"
          >
            <h2 className="font-unbounded text-brand-dark-teal text-2xl md:text-3xl mb-12 text-center leading-tight whitespace-pre-line font-normal">
              {title}
            </h2>

            <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
              <button
                onClick={onClose}
                /* Стили кнопок: w-[220px], py-4 */
                className="w-full md:w-[220px] py-4 bg-[#F07D58] text-white rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all active:scale-[0.98] font-normal"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full md:w-[220px] py-4 bg-brand-dark-teal text-white rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all active:scale-[0.98] font-normal"
              >
                Подтвердить
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};