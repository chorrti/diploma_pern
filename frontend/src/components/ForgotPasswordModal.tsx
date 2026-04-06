import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Имитация отправки
    setIsSent(true);
    
    // Закрываем окно через 2.5 секунды после успеха
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Фон */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Окно */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-[600px] p-12 shadow-2xl flex flex-col items-center rounded-[40px] text-center"
          >
            {/* Кнопка закрытия (Оранжевая) */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-12 h-12 bg-brand-orange text-white flex items-center justify-center text-2xl font-bold rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-orange/20"
            >
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>

            <h2 className="font-unbounded text-brand-dark-teal text-4xl mb-6 mt-4 leading-tight">
              Восстановление<br />пароля
            </h2>

            {!isSent ? (
              <>
                <p className="font-roboto text-brand-dark-teal text-lg mb-10 opacity-80">
                  Введите почту, к которой привязан профиль
                </p>

                <form className="w-full max-w-[420px] space-y-8" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    required
                    placeholder="helloworld@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 font-roboto text-lg outline-none focus:border-brand-accent-teal transition-all text-brand-dark-teal shadow-sm placeholder:opacity-30"
                  />

                  <button
                    type="submit"
                    className="w-full bg-brand-dark-teal text-white py-5 rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-brand-dark-teal/20"
                  >
                    Получить новый пароль
                  </button>
                </form>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-10"
              >
                <div className="w-20 h-20 bg-brand-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3D828A" strokeWidth="3">
                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-brand-accent-teal font-roboto text-xl font-bold">
                  Инструкции отправлены на почту!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};