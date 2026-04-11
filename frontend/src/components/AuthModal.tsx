import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForgotClick: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, onForgotClick, onSuccess }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    onClose();
    navigate('/registration');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен и данные пользователя
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(`Добро пожаловать, ${data.user.fullName || data.user.email}!`);
        
        onSuccess(); // Закрываем модалку через родительский компонент
        
        // Перенаправляем в профиль (App.tsx сам обработает редирект)
        navigate('/profile');
      } else {
        toast.error(data.error || "Неверный логин или пароль");
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      toast.error("Не удалось связаться с сервером");
    } finally {
      setIsLoading(false);
    }
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
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white w-full max-w-[480px] p-12 shadow-2xl flex flex-col items-center rounded-[40px]"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 bg-brand-orange text-white flex items-center justify-center text-xl font-bold rounded-xl hover:scale-105 transition-transform active:scale-95 z-10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h2 className="font-unbounded text-brand-dark-teal text-3xl mb-10 font-normal mt-4 text-center">
              Войти на сайт
            </h2>

            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-roboto text-sm text-brand-dark-teal ml-1 text-opacity-60">Логин</label>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:border-brand-accent-teal transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="font-roboto text-sm text-brand-dark-teal ml-1 text-opacity-60">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border border-gray-300 rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:border-brand-accent-teal transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#374957"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-dark-teal text-white py-4 rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Вход..." : "Войти"}
                </button>
                
                <button 
                  type="button"
                  onClick={onForgotClick}
                  className="w-full bg-[#3D828A] text-white py-3 rounded-2xl font-unbounded text-base hover:bg-opacity-90 transition-all active:scale-[0.98]"
                >
                  Забыли пароль?
                </button>
              </div>
            </form>

            <p className="mt-8 font-roboto text-sm text-gray-500">
              Ещё нет личного кабинета?{' '}
              <button onClick={handleRegisterClick} className="text-brand-orange font-medium hover:underline">
                Зарегистрироваться
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};