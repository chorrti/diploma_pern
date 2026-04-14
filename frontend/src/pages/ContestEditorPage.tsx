import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { createCompetition, updateCompetition, fetchCompetitionById, fetchThematics } from '../api/contests';
import type { Thematic } from '../api/contests';

export const ContestEditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = searchParams.get('mode') === 'edit';
  const contestId = searchParams.get('id');

  const [thematics, setThematics] = useState<Thematic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    thematicId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    resultsDate: ''
  });

  const [file, setFile] = useState<File | null>(null);

  const formatDateFromISO = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForDB = (dateStr: string): string => {
    if (!dateStr) return '';
    const [d, m, y] = dateStr.split('.');
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    const loadThematics = async () => {
      try {
        const data = await fetchThematics();
        setThematics(data);
      } catch (error) {
        console.error('Ошибка загрузки тематик:', error);
        toast.error('Не удалось загрузить тематики');
      } finally {
        setLoading(false);
      }
    };
    loadThematics();
  }, []);

  useEffect(() => {
    if (isEdit && contestId) {
      const loadContest = async () => {
        try {
          const data = await fetchCompetitionById(parseInt(contestId));
          setFormData({
            thematicId: data.thematicId.toString(),
            title: data.name,
            description: data.description || '',
            startDate: formatDateFromISO(data.startDate),
            endDate: formatDateFromISO(data.endDate),
            resultsDate: data.resultsDate ? formatDateFromISO(data.resultsDate) : ''
          });
        } catch (error) {
          console.error('Ошибка загрузки конкурса:', error);
          toast.error('Не удалось загрузить данные конкурса');
          navigate('/profile?role=moderator');
        }
      };
      loadContest();
    }
  }, [isEdit, contestId, navigate]);

  const handleDateChange = (name: string, value: string) => {
    const rawValue = value.replace(/\D/g, '');
    let formatted = rawValue;
    if (rawValue.length > 2 && rawValue.length <= 4) {
      formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2)}`;
    } else if (rawValue.length > 4) {
      formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2, 4)}.${rawValue.slice(4, 8)}`;
    }
    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const parseDate = (str: string) => {
    const [d, m, y] = str.split('.').map(Number);
    return new Date(y, m - 1, d);
  };

const validate = () => {
  const { thematicId, title, description, startDate, endDate, resultsDate } = formData;
  if (!thematicId || !title.trim() || !description.trim() || startDate.length < 10 || endDate.length < 10) {
    return "Заполните все данные конкурса";
  }
  
  // Проверка формата даты
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateRegex.test(startDate)) return "Неверный формат даты начала (ДД.ММ.ГГГГ)";
  if (!dateRegex.test(endDate)) return "Неверный формат даты окончания (ДД.ММ.ГГГГ)";
  if (resultsDate && !dateRegex.test(resultsDate)) return "Неверный формат даты результатов (ДД.ММ.ГГГГ)";
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (isNaN(start.getTime())) return "Неверная дата начала";
  if (isNaN(end.getTime())) return "Неверная дата окончания";
  if (start >= end) return "Дата начала не может быть позже конца";
  if (resultsDate) {
    const res = parseDate(resultsDate);
    if (isNaN(res.getTime())) return "Неверная дата результатов";
    if (end >= res) return "Результаты должны быть после окончания";
  }
  if (!file && !isEdit) return "Прикрепите положение конкурса";
  return null;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    
    setIsSubmitting(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('startDate', formatDateForDB(formData.startDate));
    formDataToSend.append('endDate', formatDateForDB(formData.endDate));
    if (formData.resultsDate) {
      formDataToSend.append('resultsDate', formatDateForDB(formData.resultsDate));
    }
    formDataToSend.append('thematicId', formData.thematicId);
    if (file) {
      formDataToSend.append('regulation', file);
    }
    
    try {
      if (isEdit && contestId) {
        await updateCompetition(parseInt(contestId), formDataToSend);
        toast.success('Изменения сохранены!');
      } else {
        await createCompetition(formDataToSend);
        toast.success('Конкурс успешно создан!');
      }
      setTimeout(() => {
        navigate('/profile?role=moderator');
      }, 1500);
    } catch (error: any) {
      console.error('Ошибка:', error);
      toast.error(error.response?.data?.error || 'Ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn font-roboto">
      <Toaster position="top-center" />
      
      <h1 className="font-unbounded text-3xl text-brand-dark-teal mb-10 text-center font-normal uppercase tracking-wider">
        {isEdit ? 'Редактирование конкурса' : 'Создание конкурса'}
      </h1>

      <div className="bg-[#FFF2F0] border-2 border-brand-orange rounded-[40px] p-6 mb-12 flex flex-col md:flex-row justify-between items-center px-10 gap-4 shadow-[0_6px_0_0_#F07D58]">
        <span className="font-unbounded text-2xl text-brand-red-dark uppercase font-normal">Выбрать тематику</span>
        <select 
          value={formData.thematicId}
          onChange={(e) => setFormData({...formData, thematicId: e.target.value})}
          className="w-full max-w-[400px] p-4 bg-white rounded-xl outline-none border-none font-roboto text-brand-dark-teal cursor-pointer"
        >
          <option value="">Выберите из списка</option>
          {thematics.map(thematic => (
            <option key={thematic.id} value={thematic.id}>{thematic.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Название конкурса</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none border-none font-roboto text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Описание</label>
            <textarea 
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-4 bg-[#EBF7F8] rounded-[24px] outline-none border-none font-roboto text-lg resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-8 lg:space-y-0">
          <div className="space-y-4">
            {[
              { label: 'Дата начала конкурса', key: 'startDate' },
              { label: 'Дата окончания конкурса', key: 'endDate' },
              { label: 'Дата публикации результатов', key: 'resultsDate' }
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <label className="text-sm opacity-80 ml-2">{item.label}</label>
                <input 
                  type="text"
                  maxLength={10}
                  value={(formData as any)[item.key]}
                  onChange={(e) => handleDateChange(item.key, e.target.value)}
                  placeholder="дд.мм.гггг"
                  className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none border-none font-roboto text-lg"
                />
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm opacity-80 ml-2">Положение конкурса</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-[#EBF7F8] transition-all cursor-pointer ${file ? 'border-brand-orange' : 'border-brand-accent-teal/40 hover:border-brand-orange'}`}
              >
                <input type="file" ref={fileInputRef} hidden accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
                <span className="text-3xl mb-2 opacity-60">{file ? '📄' : '☁️'}</span>
                <span className="text-xs opacity-60 text-center px-4">
                  {file ? `Выбрано: ${file.name}` : (isEdit ? 'Оставьте пустым, чтобы не менять' : 'Нажмите, чтобы загрузить PDF')}
                </span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-[#F07D58] text-white rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all uppercase tracking-wider border-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать конкурс')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};