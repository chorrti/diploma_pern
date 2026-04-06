import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export const ContestEditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = searchParams.get('mode') === 'edit';

  const [formData, setFormData] = useState({
    theme: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    resultsDate: ''
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        theme: 'Живопись',
        title: 'Конкурс под названием название название',
        description: 'Краткое описание конкурса для примера редактирования...',
        startDate: '01.01.2025',
        endDate: '02.02.2025',
        resultsDate: '03.03.2025'
      });
    }
  }, [isEdit]);

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
    const { theme, title, description, startDate, endDate, resultsDate } = formData;
    if (!theme || !title.trim() || !description.trim() || startDate.length < 10 || endDate.length < 10 || resultsDate.length < 10) {
      return "Заполните все данные конкурса";
    }
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const res = parseDate(resultsDate);
    if (start >= end) return "Дата начала не может быть позже конца";
    if (end >= res) return "Результаты должны быть после окончания";
    if (!file && !isEdit) return "Прикрепите положение конкурса";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    toast.success(isEdit ? 'Изменения сохранены!' : 'Конкурс успешно создан!');
    setTimeout(() => {
      navigate('/profile?role=moderator');
    }, 1500);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn font-roboto">
      <Toaster position="top-center" />
      
      <h1 className="font-unbounded text-3xl text-brand-dark-teal mb-10 text-center font-normal uppercase tracking-wider">
        {isEdit ? 'Редактирование конкурса' : 'Создание конкурса'}
      </h1>

      {/* ПЛАШКА С ТЕНЬЮ (Shadow-bottom) */}
      <div className="bg-[#FFF2F0] border-2 border-brand-orange rounded-[40px] p-6 mb-12 flex flex-col md:flex-row justify-between items-center px-10 gap-4 shadow-[0_6px_0_0_#F07D58]">
        <span className="font-unbounded text-2xl text-brand-red-dark uppercase font-normal">Выбрать тематику</span>
        <select 
          value={formData.theme}
          onChange={(e) => setFormData({...formData, theme: e.target.value})}
          className="w-full max-w-[400px] p-4 bg-white rounded-xl outline-none border-none font-roboto text-brand-dark-teal cursor-pointer"
        >
          <option value="">Выберите из списка</option>
          <option value="Живопись">Живопись</option>
          <option value="Графика">Графика</option>
          <option value="Архитектура">Архитектура</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* ЛЕВАЯ КОЛОНКА */}
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

        {/* ПРАВАЯ КОЛОНКА */}
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
                <input type="file" ref={fileInputRef} hidden accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
                <span className="text-3xl mb-2 opacity-60">{file ? '📄' : '☁️'}</span>
                <span className="text-xs opacity-60 text-center px-4">
                  {file ? `Выбрано: ${file.name}` : 'Нажмите, чтобы загрузить PDF или DOC'}
                </span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-[#F07D58] text-white rounded-2xl font-unbounded text-lg hover:bg-opacity-90 transition-all uppercase tracking-wider border-none shadow-none"
            >
              {isEdit ? 'Сохранить изменения' : 'Создать конкурс'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};