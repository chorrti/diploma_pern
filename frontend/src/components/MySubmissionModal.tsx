import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import type { ExhibitionWorkDetails } from '../api/exhibition';
import type { ApplicationDetails } from '../api/applications';
import { deleteExhibitionWork } from '../api/exhibition';

interface MySubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    workDetails?: ExhibitionWorkDetails | ApplicationDetails | null;
    userRole?: string | null;
    onWorkDeleted?: () => void;  // Колбэк для обновления списка после удаления
}

export const MySubmissionModal = ({ isOpen, onClose, workDetails, userRole, onWorkDeleted }: MySubmissionModalProps) => {
    if (!workDetails) return null;
    
    const isModerator = userRole === 'Модератор' || userRole === 'Админ';
    const isExhibition = 'work' in workDetails && 'author' in workDetails;
    
    const handleDeleteFromExhibition = async () => {
        if (!isExhibition || !workDetails.id) return;
        
        try {
            await deleteExhibitionWork(workDetails.id);
            toast.success('Работа удалена с выставки');
            onClose();
            if (onWorkDeleted) onWorkDeleted();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка при удалении');
        }
    };
    
    // Для выставки
    if (isExhibition) {
        const { author, teacher, work } = workDetails as ExhibitionWorkDetails;
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
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center text-xl hover:scale-105 transition-all z-20"
                            >
                                ✕
                            </button>
                            
                            <div className="p-8 md:p-12">
                                <h2 className="font-unbounded text-2xl text-brand-dark-teal mb-6 font-normal">
                                    {work.title}
                                </h2>
                                
                                {work.imageUrl && (
                                    <div className="w-full mb-6 rounded-2xl overflow-hidden bg-gray-100 flex justify-center">
                                        <img 
                                            src={work.imageUrl} 
                                            alt={work.title} 
                                            className="max-w-full h-auto object-contain"
                                        />
                                    </div>
                                )}
                                
                                <p className="font-roboto text-brand-dark-teal text-lg mb-6 leading-relaxed font-normal">
                                    {work.description}
                                </p>
                                
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
                                
                                <div className="w-full border-t border-brand-dark-teal/10 my-6"></div>
                                
                                <div className="space-y-4">
                                    <h3 className="font-unbounded text-xl text-brand-dark-teal font-normal">Автор</h3>
                                    <p className="font-roboto text-brand-dark-teal text-lg">{author.fullName}</p>
                                    <p className="font-roboto text-brand-dark-teal opacity-70">{author.organization} • {author.city}</p>
                                </div>
                                
                                {teacher && (
                                    <div className="mt-6 pt-4 border-t border-brand-dark-teal/10">
                                        <h3 className="font-unbounded text-xl text-brand-dark-teal mb-2 font-normal">Руководитель</h3>
                                        <p className="font-roboto text-brand-dark-teal text-lg">{teacher.fullName}</p>
                                    </div>
                                )}
                                
                                {/* Кнопка удаления для модератора */}
                                {isModerator && (
                                    <div className="mt-8 pt-6 border-t border-red-200">
                                        <button
                                            onClick={handleDeleteFromExhibition}
                                            className="w-full py-4 bg-red-500 text-white rounded-2xl font-unbounded text-lg hover:bg-red-600 transition-all shadow-md"
                                        >
                                            Убрать работу с выставки
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        );
    }
    
    // Для заявки (из личного кабинета)
    const { author, teacher, work, submittedAt } = workDetails as ApplicationDetails;
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
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center text-xl hover:scale-105 transition-all z-20"
                        >
                            ✕
                        </button>
                        
                        <div className="p-8 md:p-12">
                            <h2 className="font-unbounded text-2xl text-brand-dark-teal mb-6 font-normal">
                                {work.title}
                            </h2>
                            
                            {work.imageUrl && (
                                <div className="w-full mb-6 rounded-2xl overflow-hidden bg-gray-100 flex justify-center">
                                    <img 
                                        src={work.imageUrl} 
                                        alt={work.title} 
                                        className="max-w-full h-auto object-contain"
                                    />
                                </div>
                            )}
                            
                            <p className="font-roboto text-brand-dark-teal text-lg mb-6 leading-relaxed font-normal">
                                {work.description}
                            </p>
                            
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
                            
                            <div className="w-full border-t border-brand-dark-teal/10 my-6"></div>
                            
                            <div className="space-y-4">
                                <h3 className="font-unbounded text-xl text-brand-dark-teal font-normal">Автор</h3>
                                <p className="font-roboto text-brand-dark-teal text-lg">{author.fullName}</p>
                                <p className="font-roboto text-brand-dark-teal opacity-70">{author.organization} • {author.city}</p>
                            </div>
                            
                            {teacher && (
                                <div className="mt-6 pt-4 border-t border-brand-dark-teal/10">
                                    <h3 className="font-unbounded text-xl text-brand-dark-teal mb-2 font-normal">Руководитель</h3>
                                    <p className="font-roboto text-brand-dark-teal text-lg">{teacher.fullName}</p>
                                </div>
                            )}
                            
                            <div className="mt-6 pt-4 border-t border-brand-dark-teal/10">
                                <p className="font-roboto text-sm text-brand-dark-teal/60">
                                    Дата подачи: {new Date(submittedAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};