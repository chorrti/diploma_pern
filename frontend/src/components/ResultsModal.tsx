import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fetchResultsByCompetition } from '../api/results';
import type { Winner } from '../api/results';

interface ResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contestTitle: string;
    competitionId: number;  // ← добавляем ID конкурса
}

export const ResultsModal = ({ isOpen, onClose, contestTitle, competitionId }: ResultsModalProps) => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && competitionId) {
            const loadResults = async () => {
                try {
                    setLoading(true);
                    const data = await fetchResultsByCompetition(competitionId);
                    setWinners(data);
                    setError(null);
                } catch (err) {
                    console.error('Ошибка загрузки результатов:', err);
                    setError('Не удалось загрузить результаты');
                } finally {
                    setLoading(false);
                }
            };
            loadResults();
        }
    }, [isOpen, competitionId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Оверлей */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    />
                    
                    {/* Модальное окно */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="relative bg-white w-full max-w-[1100px] max-h-[90vh] flex flex-col p-8 md:p-12 rounded-[40px] shadow-2xl"
                    >
                        {/* Кнопка закрытия */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-[#F07D58] text-white rounded-xl flex items-center justify-center font-unbounded text-xl hover:bg-opacity-90 transition-all z-10 font-normal"
                        >
                            ✕
                        </button>
                        
                        {/* Заголовок */}
                        <h2 className="font-unbounded text-brand-dark-teal text-xl md:text-2xl mb-6 pr-14 leading-tight font-normal">
                            {contestTitle}
                        </h2>
                        
                        {/* Содержимое с прокруткой */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4 -mx-2">
                            {loading ? (
                                <p className="text-center text-gray-500 py-10">Загрузка...</p>
                            ) : error ? (
                                <p className="text-center text-red-500 py-10">{error}</p>
                            ) : winners.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">Результаты ещё не опубликованы</p>
                            ) : (
                                <div className="space-y-6">
                                    {winners.map((winner) => (
                                        <div 
                                            key={winner.id} 
                                            className="bg-brand-light-teal border border-brand-accent-teal rounded-[30px] p-6 md:p-8 shadow-[0_4px_0_0_#337D86] transition-all hover:translate-y-[-4px] active:translate-y-[0px]"
                                        >
                                            <div className="w-full mb-4">
                                                <p className="font-unbounded text-brand-dark-teal text-lg font-normal leading-tight">
                                                    {winner.fullName}
                                                </p>
                                            </div>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                {winner.diplomaLink ? (
                                                    <a 
                                                        href={winner.diplomaLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="font-unbounded text-brand-accent-teal text-sm border-b border-brand-accent-teal hover:opacity-70 transition-opacity font-normal"
                                                    >
                                                        Ссылка на файл диплома
                                                    </a>
                                                ) : (
                                                    <span className="font-unbounded text-gray-400 text-sm font-normal">
                                                        Диплом недоступен
                                                    </span>
                                                )}
                                                <p className="font-unbounded text-brand-dark-teal text-sm font-normal">
                                                    Степень диплома: <span className="opacity-70">{winner.degree}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};