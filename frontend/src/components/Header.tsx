import { Link, useLocation } from 'react-router-dom';

const LogoIcon = () => (
  <svg width="45" height="50" viewBox="0 0 45 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M41.7857 44.6429C41.7857 45.5901 41.4094 46.4985 40.7397 47.1682C40.0699 47.838 39.1615 48.2143 38.2143 48.2143H6.07143C5.12423 48.2143 4.21582 47.838 3.54605 47.1682C2.87627 46.4985 2.5 45.5901 2.5 44.6429V5.35715C2.5 4.40995 2.87627 3.50154 3.54605 2.83177C4.21582 2.162 5.12423 1.78572 6.07143 1.78572H29.2857L41.7857 14.2857V44.6429Z" stroke="#1A4F56" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25.7143 26.7857L18.5714 19.6429L11.4286 26.7857V1.78572H25.7143V26.7857Z" stroke="#1A4F56" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface HeaderProps {
  onLoginClick: () => void;
  isAuth: boolean; // Добавили статус авторизации
}

export const Header = ({ onLoginClick, isAuth }: HeaderProps) => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `transition-colors ${
      isActive ? 'text-brand-orange underline underline-offset-8' : 'hover:text-brand-orange text-brand-dark-teal'
    }`;
  };

  return (
    <header className="w-full max-w-[1200px] mx-auto flex items-center justify-between px-6 py-10">
      <Link to="/" className="flex items-center gap-4 cursor-pointer group">
        <LogoIcon />
        <h1 className="font-unbounded text-4xl text-brand-dark-teal tracking-tighter font-normal leading-none mb-1 group-hover:opacity-80 transition-opacity">
          Портфель
        </h1>
      </Link>

      <nav className="flex items-center gap-10 font-roboto text-lg">
        <Link to="/" className={getLinkClass('/')}>
          Главная
        </Link>
        <Link to="/regulations" className={getLinkClass('/regulations')}>
          Положение
        </Link>
        <Link to="/contacts" className={getLinkClass('/contacts')}>
          Контакты
        </Link>
        
        {isAuth ? (
          /* Если залогинен — кнопка Профиль */
          <Link 
            to="/profile"
            className={`border border-brand-dark-teal px-12 py-3 rounded-xl hover:bg-brand-dark-teal hover:text-white transition-all text-base font-normal ${
              location.pathname === '/profile' ? 'bg-brand-dark-teal text-white' : 'text-brand-dark-teal'
            }`}
          >
            Профиль
          </Link>
        ) : (
          /* Если нет — твоя кнопка Войти */
          <button 
            onClick={onLoginClick}
            className="border border-brand-dark-teal px-12 py-3 rounded-xl hover:bg-brand-dark-teal hover:text-white transition-all text-base font-normal text-brand-dark-teal"
          >
            Войти
          </button>
        )}
      </nav>
    </header>
  );
};