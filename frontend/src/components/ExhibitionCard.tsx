import { motion } from 'framer-motion';

interface ExhibitionCardProps {
    author: string;
    city: string;
    image?: string | null;
    onClick: () => void;
}

export const ExhibitionCard = ({ author, city, image, onClick }: ExhibitionCardProps) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="flex flex-col border-2 border-brand-accent-teal rounded-sm overflow-hidden h-[400px] cursor-pointer"
        >
            {/* Шапка с автором */}
            <div className="bg-white py-4 px-2 border-b-2 border-brand-accent-teal flex items-center justify-center text-center">
                <h3 className="font-unbounded text-brand-accent-teal text-sm leading-tight uppercase">
                    {author}
                </h3>
            </div>
            
            {/* Тело карточки */}
            <div className="flex-grow bg-brand-accent-teal relative flex items-center justify-center">
                {image ? (
                    <img 
                        src={image} 
                        alt={author} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-white/50 text-sm font-roboto">
                        Нет изображения
                    </div>
                )}
            </div>
        </motion.div>
    );
};