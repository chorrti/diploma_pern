import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ProfilePage } from './pages/ProfilePage';
import { Home } from './pages/Home';
import { Registration } from './pages/Registration';
import { ContestPage } from './pages/ContestPage';
import { Regulations } from './pages/Regulations';
import { Contacts } from './pages/Contacts';
import { CreateStudent } from './pages/CreateStudent';
import { ContestEditorPage } from './pages/ContestEditorPage';

import { Toaster } from 'react-hot-toast';

// Вспомогательный компонент для автоматической прокрутки вверх при переходе по ссылкам
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false); // Состояние для модалки восстановления
  
// Вместо const [isAuth, setIsAuth] = useState(false);
const [isAuth, setIsAuth] = useState(() => {
  // Проверяем, есть ли токен в localStorage
  return !!localStorage.getItem('token');
});

  // Обработчик логаута
  const handleLogout = () => {
    // Сначала меняем состояние
    setIsAuth(false);
    // Затем редирект на главную
    navigate('/'); 
    console.log('Пользователь вышел из системы');
  };

  // Обработчик успешного входа
  const handleLoginSuccess = () => {
    setIsAuth(true);
    setIsAuthModalOpen(false);
    // После логина обычно ведем в профиль
    navigate('/profile');
    console.log('Вход выполнен успешно');
  };

  // Функция для открытия восстановления пароля из окна авторизации
  const handleOpenForgot = () => {
    setIsAuthModalOpen(false);
    setIsForgotModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-roboto flex flex-col">
      <ScrollToTop />
      
      <Header 
        isAuth={isAuth} 
        onLoginClick={() => setIsAuthModalOpen(true)} 
      />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/contest" element={<ContestPage />} />
          <Route path="/regulations" element={<Regulations />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/create-student" element={<CreateStudent />} />
          <Route path="/contest/edit" element={<ContestEditorPage />} />
          
          {/* Страница профиля. Если isAuth false, 
              она всё равно откроется (для вёрстки), 
              но кнопка в хедере будет "Войти" */}
          <Route 
            path="/profile" 
            element={<ProfilePage onLogout={handleLogout} />} 
          />
        </Routes>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onForgotClick={handleOpenForgot}
        onSuccess={handleLoginSuccess}
      />

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <Router>
       <Toaster position="top-center" />
      <AppContent />
    </Router>
  );
}

export default App;