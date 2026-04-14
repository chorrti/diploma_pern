import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { fetchApplicationsForCompetition } from '../../../api/applications';
import { publishCompetitionResults } from '../../../api/results';
import { fetchDegrees } from '../../../api/dictionaries';
import type { MyApplication } from '../../../api/applications';
import type { Degree } from '../../../api/dictionaries';

interface Diplomant {
  id: number;
  applicationId: number;
  studentName: string;
  degreeId: number;
  file: File | null;
}

interface PublishResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestId: number;
  contestTitle: string;
  onSuccess: () => void;
}

export const PublishResultsModal = ({ isOpen, onClose, contestId, contestTitle, onSuccess }: PublishResultsModalProps) => {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [diplomants, setDiplomants] = useState<Diplomant[]>(() => [
    { id: Date.now(), applicationId: 0, studentName: '', degreeId: 0, file: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && contestId) {
      const loadData = async () => {
        setLoading(true);
        try {
          const [apps, degreesData] = await Promise.all([
            fetchApplicationsForCompetition(contestId),
            fetchDegrees()
          ]);
          setApplications(apps);
          setDegrees(degreesData);
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
          toast.error('Не удалось загрузить данные');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen, contestId]);

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setDiplomants([{ id: Date.now(), applicationId: 0, studentName: '', degreeId: 0, file: null }]);
    }
  }, [isOpen]);

  const addDiplomant = () => {
    setDiplomants(prev => [...prev, { id: Date.now(), applicationId: 0, studentName: '', degreeId: 0, file: null }]);
  };

  const removeDiplomant = (id: number) => {
    if (diplomants.length > 1) {
      setDiplomants(prev => prev.filter(d => d.id !== id));
    }
  };

  const updateDiplomant = (id: number, field: keyof Diplomant, value: any) => {
    setDiplomants(prev => prev.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleStudentSelect = (id: number, applicationId: number) => {
    const selectedApp = applications.find(a => a.id === applicationId);
    if (selectedApp) {
      updateDiplomant(id, 'applicationId', applicationId);
      updateDiplomant(id, 'studentName', selectedApp.studentName);
    }
  };

  const handleFileChange = (id: number, file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      toast.error('Можно загружать только PDF файлы');
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('Файл не должен превышать 10 МБ');
      return;
    }
    updateDiplomant(id, 'file', file);
  };

  const handlePublish = async () => {
    for (const d of diplomants) {
      if (!d.applicationId) {
        toast.error('Выберите ученика для всех дипломантов');
        return;
      }
      if (!d.degreeId) {
        toast.error('Выберите степень диплома для всех дипломантов');
        return;
      }
      if (!d.file) {
        toast.error('Загрузите файл диплома для всех дипломантов');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const results = diplomants.map(d => ({
        applicationId: d.applicationId,
        degreeId: d.degreeId
      }));
      const files = diplomants.map(d => d.file!);
      
      await publishCompetitionResults(contestId, results, files);
      toast.success('Результаты успешно опубликованы');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка публикации:', error);
      toast.error('Не удалось опубликовать результаты');
    } finally {
      setIsSubmitting(false);
    }
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
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-brand-orange text-white flex items-center justify-center text-xl font-bold rounded-xl hover:scale-105 transition-transform"
            >
              ✕
            </button>

            <h2 className="font-unbounded text-brand-dark-teal text-2xl md:text-3xl mb-8 pr-10">
              Конкурс: {contestTitle}
            </h2>

            {loading ? (
              <div className="text-center py-20">Загрузка...</div>
            ) : (
              <>
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
                          <select 
                            value={d.applicationId || ''}
                            onChange={(e) => handleStudentSelect(d.id, Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-brand-accent-teal appearance-none cursor-pointer"
                          >
                            <option value="">Выберите ученика из списка заявок...</option>
                            {applications.map(app => (
                              <option key={app.id} value={app.id}>
                                {app.studentName} - {app.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Загрузка файла */}
                        <div className="space-y-2">
                          <label className="font-roboto text-sm text-brand-dark-teal opacity-60 ml-2">Файл диплома (PDF)</label>
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
                              {d.file ? d.file.name : "Перетащите или нажмите, чтобы загрузить PDF"}
                            </p>
                          </div>
                          <p className="text-[10px] text-center text-gray-400 mt-1">Только PDF, до 10 МБ</p>
                        </div>

                        {/* Степень диплома */}
                        <div className="space-y-2">
                          <label className="font-roboto text-sm text-brand-dark-teal opacity-60 ml-2">Степень диплома</label>
                          <select 
                            value={d.degreeId || ''}
                            onChange={(e) => updateDiplomant(d.id, 'degreeId', Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-brand-accent-teal appearance-none cursor-pointer"
                          >
                            <option value="">Выберите степень...</option>
                            {degrees.map(degree => (
                              <option key={degree.id} value={degree.id}>{degree.name}</option>
                            ))}
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
                    disabled={isSubmitting}
                    className="w-full py-5 bg-brand-orange text-white rounded-2xl font-unbounded text-lg shadow-xl shadow-brand-orange/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Публикация...' : 'Опубликовать результаты'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};