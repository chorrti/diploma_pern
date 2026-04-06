import { motion } from 'framer-motion';

interface ExhibitionCardProps {
  author: string;
  image?: string; 
}

export const ExhibitionCard = ({ author, image }: ExhibitionCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      // Изменил border на border-2 (2px)
      className="flex flex-col border-2 border-brand-accent-teal rounded-sm overflow-hidden h-[400px]"
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
          </div>
        )}
      </div>
    </motion.div>
  );
};