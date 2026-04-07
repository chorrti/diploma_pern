import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Diplomant {
  id: number;
  name: string;
  degree: string;
  file: File | null;
}

interface PublishResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestTitle: string;
}

export const PublishResultsModal = ({ isOpen, onClose, contestTitle }: PublishResultsModalProps) => {
  const [diplomants, setDiplomants] = useState<Diplomant[]>([
    { id: Date.now(), name: '', degree: '', file: null }
  ]);

  const addDiplomant = () => {
    setDiplomants([...diplomants, { id: Date.now(), name: '', degree: '', file: null }]);
  };

  const removeDiplomant = (id: number) => {
    if (diplomants.length > 1) {
      setDiplomants(diplomants.filter(d => d.id !== id));
    }
  };

  const handleFileChange = (id: number, file: File | null) => {
    setDiplomants(diplomants.map(d => d.id === id ? { ...d, file } : d));
  };

  const handlePublish = () => {
    console.log('Публикация результатов:', { contestTitle, diplomants });
    // Здесь будет логика отправки на бэкенд
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl rounded-[40px]"
          >
            {/* Кнопка закрытия */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-brand-orange text-white flex items-center justify-center text-xl font-bold rounded-xl hover:scale-105 transition-transform"
            >
              ✕
            </button>

            <h2 className="font-unbounded text-brand-dark-teal text-2xl md:text-3xl mb-8 pr-10">
              Конкурс: {contestTitle}
            </h2>

            <div className="space-y-6 mb-10">
              {diplomants.map((d, index) => (
                <div key={d.id} className="relative bg-[#F0F9FA] border-2 border-brand-accent-teal/20 rounded-[32px] p-6 md:p-8">
                  <button 
                    onClick={() => removeDiplomant(d.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-brand-dark-teal text-white rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
                  >
                    ✕
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Выбор ученика */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-roboto text-sm text-brand-dark-teal opacity-60 ml-2">Ученик</label>
                      <select className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-brand-accent-teal appearance-none cursor-pointer">
                        <option value="">Выберите ученика из списка заявок...</option>
                        <option value="1">Иванов Иван</option>
                        <option value="2">Петров Петр</option>
                      </select>
                    </div>

                    {/* Загрузка файла */}
                    <div className="space-y-2">
                      <label className="font-roboto text-sm text-brand-dark-teal opacity-60 ml-2">Файл диплома</label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-white flex flex-col items-center justify-center text-center group hover:border-brand-accent-teal transition-colors cursor-pointer">
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={(e) => handleFileChange(d.id, e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 text-brand-dark-teal">
                          <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="text-xs text-brand-dark-teal px-4">
                          {d.file ? d.file.name : "Перетащите или нажмите, чтобы загрузить файл"}
                        </p>
                      </div>
                      <p className="text-[10px] text-center text-gray-400 mt-1">Допустимые форматы: pdf</p>
                    </div>

                    {/* Степень диплома */}
                    <div className="space-y-2">
                      <label className="font-roboto text-sm text-brand-dark-teal opacity-60 ml-2">Степень диплома</label>
                      <select className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 outline-none focus:border-brand-accent-teal appearance-none cursor-pointer">
                        <option value="">Выберите степень...</option>
                        <option value="1">Лауреат I степени</option>
                        <option value="2">Лауреат II степени</option>
                        <option value="3">Лауреат III степени</option>
                        <option value="4">Дипломант</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={addDiplomant}
                className="w-full py-4 bg-brand-dark-teal/10 text-brand-dark-teal border-2 border-brand-dark-teal border-dashed rounded-2xl font-unbounded hover:bg-brand-dark-teal/20 transition-all"
              >
                + Добавить дипломанта
              </button>

              <button
                onClick={handlePublish}
                className="w-full py-5 bg-brand-orange text-white rounded-2xl font-unbounded text-lg shadow-xl shadow-brand-orange/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Опубликовать результаты
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};