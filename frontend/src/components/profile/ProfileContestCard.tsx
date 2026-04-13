import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
  id: number;
  title: string;
  start: string;
  end: string;
  results: string;
  desc: string;
  variant: 'participation' | 'portfolio';
  diploma?: string;
  onOpenSubmission?: () => void;
  onDownloadDiploma?: () => void;
}

export const ProfileContestCard = ({ 
  id,
  title, 
  start, 
  end, 
  results, 
  desc, 
  variant, 
  diploma, 
  onOpenSubmission,
  onDownloadDiploma
}: ProfileCardProps) => {
  const navigate = useNavigate();
  const isPortfolio = variant === 'portfolio';

  const handleNavigate = () => {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    if (isPortfolio) {
      params.append('status', 'finished');
    }
    navigate(`/contest?${params.toString()}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPortfolio && onDownloadDiploma) {
      onDownloadDiploma();
    } else if (!isPortfolio && onOpenSubmission) {
      onOpenSubmission();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-[40px] p-10 border transition-all mb-8 ${
        isPortfolio 
          ? 'bg-[#FFF2F0] border-brand-orange shadow-[0_6px_0_0_#F07D58]' 
          : 'bg-brand-light-teal border-brand-accent-teal shadow-[0_6px_0_0_#337D86]'
      }`}
    >
      <div className="flex justify-between gap-10">
        <div className="flex-1 cursor-pointer" onClick={handleNavigate}>
          <h3 className={`font-unbounded text-2xl mb-6 leading-tight font-normal ${
            isPortfolio ? 'text-brand-red-dark' : 'text-brand-dark-teal'
          }`}>
            {title}
          </h3>
          <div className={`space-y-2 font-unbounded text-sm font-normal ${
            isPortfolio ? 'text-brand-red-dark' : 'text-brand-dark-teal'
          }`}>
            <p>Начало: {start}</p>
            <p>Конец: {end}</p>
            <p>Результаты: {results}</p>
          </div>
          
          {isPortfolio && diploma && (
            <div className="mt-6">
               <p className="font-unbounded text-xl text-brand-orange uppercase italic tracking-wider">
                {diploma}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 w-[300px] justify-center">
          <button 
            onClick={handleButtonClick}
            className={`w-full bg-transparent border py-3.5 rounded-xl font-roboto transition-all text-base tracking-wide font-normal ${
              isPortfolio 
                ? 'border-brand-red-dark text-brand-red-dark hover:bg-brand-red-dark hover:text-white' 
                : 'border-brand-dark-teal text-brand-dark-teal hover:bg-brand-dark-teal hover:text-white'
            }`}
          >
            {isPortfolio ? 'Скачать диплом' : 'Моя заявка'}
          </button>
        </div>
      </div>

      <div 
        onClick={handleNavigate}
        className={`mt-6 pt-6 border-t cursor-pointer ${isPortfolio ? 'border-brand-orange/30' : 'border-brand-dark-teal/20'}`}
      >
        <p className={`text-sm font-roboto opacity-70 font-normal ${
          isPortfolio ? 'text-brand-red-dark' : 'text-brand-dark-teal'
        }`}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
};