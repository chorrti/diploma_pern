import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const rolesFromDB = ['Ученик'];

export const CreateStudent = () => {
  const navigate = useNavigate();
  
  // В реальности здесь будет ФИО из стейта авторизации или API
  const teacherName = "ИВАНОВА И.И."; 

  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    patronymic: '',
    email: '',
    birthDate: '',
    phone: '',
    city: '',
    organization: '',
    role: rolesFromDB[0]
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 8) value = value.slice(0, 8);
    const runs = [{ len: 2, char: '.' }, { len: 4, char: '.' }];
    let formattedValue = '';
    let lastIndex = 0;
    runs.forEach((run) => {
      if (value.length > run.len) {
        formattedValue += value.slice(lastIndex, run.len) + run.char;
        lastIndex = run.len;
      }
    });
    formattedValue += value.slice(lastIndex);
    setFormData({ ...formData, birthDate: formattedValue });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.startsWith('7') || value.startsWith('8')) value = value.slice(1); 
    if (value.length > 10) value = value.slice(0, 10); 
    let formattedValue = '+7 ';
    if (value.length > 0) formattedValue += '(' + value.slice(0, 3);
    if (value.length > 3) formattedValue += ') ' + value.slice(3, 6);
    if (value.length > 6) formattedValue += '-' + value.slice(6, 8);
    if (value.length > 8) formattedValue += '-' + value.slice(8, 10);
    setFormData({ ...formData, phone: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAllFilled = Object.entries(formData).every(([key, value]) => {
      if (key === 'phone') return value.length === 18;
      return value.trim() !== '';
    });

    if (!isAllFilled) {
      toast.error('Пожалуйста, заполните все поля!');
      return;
    }

    toast.success('Профиль ученика успешно создан!');
    // Возвращаемся в кабинет учителя (с ролью, чтобы верстка не слетела)
    setTimeout(() => navigate('/profile?role=teacher'), 2000);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn">
      <Toaster />

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={handleSubmit} noValidate>
        {/* Левая колонка */}
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Фамилия</label>
            <input type="text" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Имя</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Отчество</label>
            <input type="text" value={formData.patronymic} onChange={(e) => setFormData({...formData, patronymic: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Почта</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Роль</label>
            <div className="relative">
              <select className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent-teal transition-all" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                {rolesFromDB.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 2L10 10L18 2" stroke="#1A4F56" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Дата рождения</label>
            <input type="text" placeholder="ДД.ММ.ГГГГ" value={formData.birthDate} onChange={handleDateChange} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Телефон</label>
            <input type="tel" placeholder="+7 (XXX) XXX-XX-XX" value={formData.phone} onChange={handlePhoneChange} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Город</label>
            <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1">Организация</label>
            <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>

          <div className="pt-9">
            <button type="submit" className="w-full bg-[#3D828A] text-white px-10 py-4 rounded-2xl font-roboto text-lg hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-lg">
              Создать профиль ученика
            </button>
          </div>
        </div>
      </form>

      {/* Информационная надпись снизу */}
      <div className="mt-16 text-center">
        <p className="text-[#C5391B] font-roboto text-2xl font-bold uppercase tracking-tight">
          Ученик будет прикреплён к {teacherName}
        </p>
      </div>
    </div>
  );
};