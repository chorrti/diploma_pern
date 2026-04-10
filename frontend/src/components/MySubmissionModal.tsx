import { motion, AnimatePresence } from 'framer-motion';
import type { ExhibitionWorkDetails } from '../api/exhibition';

interface MySubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    workDetails?: ExhibitionWorkDetails | null;
}

export const MySubmissionModal = ({ isOpen, onClose, workDetails }: MySubmissionModalProps) => {
    if (!workDetails) return null;
    
    const { author, teacher, work } = workDetails;
    
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl z-10"
                    >
                        {/* Кнопка закрытия */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center text-xl hover:scale-105 transition-all z-20"
                        >
                            ✕
                        </button>
                        
                        <div className="p-8 md:p-12">
                            {/* Название работы (теперь сверху) */}
                            <h2 className="font-unbounded text-2xl text-brand-dark-teal mb-6 font-normal">
                                {work.title}
                            </h2>
                            
                            {/* Изображение */}
                            {work.imageUrl && (
                                <div className="w-full h-64 mb-6 rounded-2xl overflow-hidden bg-gray-100">
                                    <img 
                                        src={work.imageUrl} 
                                        alt={work.title} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            
                            {/* Описание */}
                            <p className="font-roboto text-brand-dark-teal text-lg mb-6 leading-relaxed font-normal">
                                {work.description}
                            </p>
                            
                            {/* Ссылка */}
                            {work.linkUrl && (
                                <div className="mb-6">
                                    <span className="font-roboto text-sm text-brand-dark-teal/60">Ссылка на материалы:</span>
                                    <a 
                                        href={work.linkUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block font-roboto text-brand-accent-teal underline break-all"
                                    >
                                        {work.linkUrl}
                                    </a>
                                </div>
                            )}
                            
                            {/* Разделитель */}
                            <div className="w-full border-t border-brand-dark-teal/10 my-6"></div>
                            
                            {/* Информация об авторе (без телефона и почты) */}
                            <div className="space-y-4">
                                <h3 className="font-unbounded text-xl text-brand-dark-teal font-normal">Автор</h3>
                                <p className="font-roboto text-brand-dark-teal text-lg">
                                    {author.fullName}
                                </p>
                                <p className="font-roboto text-brand-dark-teal opacity-70">
                                    {author.organization} • {author.city}
                                </p>
                            </div>
                            
                            {/* Руководитель */}
                            {teacher && (
                                <div className="mt-6 pt-4 border-t border-brand-dark-teal/10">
                                    <h3 className="font-unbounded text-xl text-brand-dark-teal mb-2 font-normal">Руководитель</h3>
                                    <p className="font-roboto text-brand-dark-teal text-lg">{teacher.fullName}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};