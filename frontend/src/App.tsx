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
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  
  const [isAuth, setIsAuth] = useState(() => {
    return !!localStorage.getItem('token');
  });
  
  // Храним данные пользователя
  const [user, setUser] = useState<{ role: string; fullName: string } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuth(false);
    setUser(null);
    navigate('/');
  };

  const handleLoginSuccess = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuth(true);
    setIsAuthModalOpen(false);
    navigate('/profile');
  };

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
          <Route path="/" element={<Home userRole={user?.role || null} />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/contest" element={<ContestPage userRole={user?.role || null} />} />
          <Route path="/regulations" element={<Regulations />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/create-student" element={<CreateStudent />} />
          <Route path="/contest/edit" element={<ContestEditorPage />} />
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