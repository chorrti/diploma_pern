import { useState, useRef, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import api from '../api/client';

interface ContestFormProps {
  userRole: string | null;
  contestId: number;
  onSuccess: () => void;
}

export const ContestForm = ({ userRole, contestId, onSuccess }: ContestFormProps) => {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTeacher = userRole === 'teacher';

  const initialState = {
    surname: '', name: '', patronymic: '', org: '', city: '',
    bossName: '', bossPhone: '', bossEmail: '',
    workTitle: '', workDesc: '', link: '', exhibition: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState({ rules: false, pdn: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('7') || value.startsWith('8')) value = value.slice(1);
    if (value.length > 10) value = value.slice(0, 10);
    let formattedValue = '+7 ';
    if (value.length > 0) formattedValue += '(' + value.slice(0, 3);
    if (value.length > 3) formattedValue += ') ' + value.slice(3, 6);
    if (value.length > 6) formattedValue += '-' + value.slice(6, 8);
    if (value.length > 8) formattedValue += '-' + value.slice(8, 10);
    setFormData({...formData, bossPhone: formattedValue});
  };

  const validate = () => {
    const { workDesc, link, exhibition, ...required } = formData;
    if (Object.values(required).some(v => !v.trim())) return "Заполните все данные";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.bossEmail)) return "Введите корректную почту";
    if (formData.bossPhone.length < 18) return "Введите полный номер телефона";
    if (!file && !link.trim()) return "Нужно фото работы ИЛИ ссылка на диск";
    if (!agreed.rules || !agreed.pdn) return "Подтвердите согласия внизу";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    
    setIsSubmitting(true);
    
    // TODO: Собрать FormData для отправки
    const formDataToSend = new FormData();
    formDataToSend.append('contestId', contestId.toString());
    formDataToSend.append('studentData', JSON.stringify({
      surname: formData.surname,
      name: formData.name,
      patronymic: formData.patronymic,
      org: formData.org,
      city: formData.city,
      bossName: formData.bossName,
      bossPhone: formData.bossPhone,
      bossEmail: formData.bossEmail,
      workTitle: formData.workTitle,
      workDesc: formData.workDesc,
      link: formData.link,
      exhibition: formData.exhibition
    }));
    if (file) {
      formDataToSend.append('file', file);
    }
    
    try {
      await api.post('/applications', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Заявка успешно отправлена!');
      setFormData(initialState);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className="w-full pb-20">
      <Toaster position="top-center" />
      
      {isTeacher && (
        <div className="bg-[#FFF2F0] border-2 border-brand-orange rounded-[40px] p-6 mb-10 flex flex-col md:flex-row justify-between items-center px-10 gap-4">
          <span className="font-unbounded text-2xl text-brand-red-dark">Выбрать ученика</span>
          <select className="w-full max-w-[400px] p-4 bg-white rounded-xl outline-none border-none font-roboto text-brand-dark-teal cursor-pointer">
            <option value="">Выберите из списка</option>
            <option>Иванов Иван Иванович</option>
            <option>Петров Петр Петрович</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Фамилия</label>
            <input type="text" value={formData.surname} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, surname: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Имя</label>
            <input type="text" value={formData.name} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Отчество</label>
            <input type="text" value={formData.patronymic} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, patronymic: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Учреждение</label>
            <input type="text" value={formData.org} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, org: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Город</label>
            <input type="text" value={formData.city} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">ФИО Руководителя</label>
            <input type="text" value={formData.bossName} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, bossName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Номер руководителя</label>
            <input type="tel" value={formData.bossPhone} placeholder="+7 (XXX) XXX-XX-XX" className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={handlePhoneChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Почта руководителя</label>
            <input type="email" value={formData.bossEmail} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, bossEmail: e.target.value})} />
          </div>
          
          <div className="pt-4 space-y-4">
            <p className="text-sm opacity-80 ml-2">Согласны на участие в выставке?</p>
            <div className="flex gap-10 ml-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="exhibition" value="yes" className="accent-brand-orange" onChange={e => e.target.checked && setFormData({...formData, exhibition: 'Да'})} /> Да
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="exhibition" value="no" className="accent-brand-orange" onChange={e => e.target.checked && setFormData({...formData, exhibition: 'Нет'})} /> Нет
              </label>
            </div>
          </div>

          <div className="bg-[#EBF7F8] p-6 rounded-2xl space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed.rules} className="mt-1 accent-brand-dark-teal" onChange={e => setAgreed({...agreed, rules: e.target.checked})} />
              <span className="text-sm">Я ознакомлен с положением конкурса</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed.pdn} className="mt-1 accent-brand-dark-teal" onChange={e => setAgreed({...agreed, pdn: e.target.checked})} />
              <span className="text-sm">Я согласен на обработку персональных данных</span>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Название работы</label>
            <input type="text" value={formData.workTitle} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, workTitle: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Описание работы</label>
            <textarea value={formData.workDesc} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none h-32 resize-none" onChange={e => setFormData({...formData, workDesc: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2">Изображение работы</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-[#EBF7F8] transition-all cursor-pointer ${file ? 'border-brand-orange' : 'border-brand-accent-teal hover:border-brand-orange'}`}
            >
              <input type="file" ref={fileInputRef} accept="image/png,image/jpeg" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
              <span className="text-xs opacity-60 text-center px-4">{file ? `Выбрано: ${file.name}` : 'Допустимые форматы: png, jpg'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm opacity-80 ml-2 text-wrap">И/или прикрепите ссылку на диск с работой</label>
            <input type="text" value={formData.link} className="w-full p-4 bg-[#EBF7F8] rounded-xl outline-none" onChange={e => setFormData({...formData, link: e.target.value})} />
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 flex justify-center pt-10">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:max-w-[400px] py-4 bg-[#F07D58] text-white rounded-2xl font-unbounded text-lg hover:bg-opacity-90 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </div>
      </form>
    </div>
  );
};