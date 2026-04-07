import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Импортируем хук
import { MySubmissionModal } from './MySubmissionModal';

interface ExhibitionCardProps {
  author: string;
  image?: string;
}

export const ExhibitionCard = ({ author, image }: ExhibitionCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Определяем роль так же, как в ProfilePage
  const role = searchParams.get('role');
  const isModerator = role === 'moderator';

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col border-2 border-brand-accent-teal rounded-sm overflow-hidden h-[400px] cursor-pointer"
      >
        {/* Шапка с автором */}
        <div className="bg-white py-4 px-2 border-b-2 border-brand-accent-teal flex items-center justify-center text-center">
          <h3 className="font-unbounded text-brand-accent-teal text-sm leading-tight uppercase">
            {author}
          </h3>
        </div>
        
        {/* Тело карточки */}
        <div className="flex-grow bg-brand-accent-teal relative">
          {image ? (
            <img src={image} alt={author} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {/* Заглушка */}
            </div>
          )}
        </div>
      </motion.div>

      {/* Модальное окно */}
      <MySubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        // Теперь проп передается на основе реальной роли из URL
        isModerator={isModerator}
      />
    </>
  );
};