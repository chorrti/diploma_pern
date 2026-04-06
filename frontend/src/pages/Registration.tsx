import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

// Словарь для перевода текстовой роли в ID из базы данных
const roleMapping: { [key: string]: number } = {
  'Ученик': 1,
  'Учитель': 2
};

const rolesFromDB = ['Ученик', 'Учитель'];

export const Registration = () => {
  const navigate = useNavigate();

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

  // Превращаем "ДД.ММ.ГГГГ" в "ГГГГ-ММ-ДД" для PostgreSQL
  const formatDateForDB = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
  };

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

  const isValidDate = (dateStr: string) => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
    const [day, month, year] = dateStr.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    return year > 1900 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= now;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isAllFilled = Object.entries(formData).every(([key, value]) => {
      if (key === 'phone') return value.length === 18;
      return value.trim() !== '';
    });

    if (!isAllFilled) {
      toast.error('Пожалуйста, заполните все поля формы!');
      return;
    }

    if (!isValidDate(formData.birthDate)) {
      toast.error('Введите реальную дату рождения!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Введите корректный адрес почты!');
      return;
    }

    const dataToSend = {
      familia: formData.surname,
      name: formData.name,
      otchestvo: formData.patronymic,
      email: formData.email,
      role_id: roleMapping[formData.role],
      birth_date: formatDateForDB(formData.birthDate),
      phone: formData.phone,
      city: formData.city,
      organization: formData.organization
    };

    try {
      // ПУТЬ ОБНОВЛЕН: теперь используем /api/register/apply
      const response = await fetch("http://localhost:5000/api/register/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Заявка успешно отправлена!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка при отправке заявки');
      }
    } catch (err) {
      console.error("Ошибка сети:", err);
      toast.error('Не удалось связаться с сервером');
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 relative">
      <Toaster />
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={handleSubmit} noValidate>
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Фамилия</label>
            <input type="text" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Имя</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Отчество</label>
            <input type="text" value={formData.patronymic} onChange={(e) => setFormData({...formData, patronymic: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Почта</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Роль</label>
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

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Дата рождения</label>
            <input type="text" placeholder="ДД.ММ.ГГГГ" value={formData.birthDate} onChange={handleDateChange} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Телефон</label>
            <input type="tel" placeholder="+7 (XXX) XXX-XX-XX" value={formData.phone} onChange={handlePhoneChange} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Город</label>
            <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="space-y-2">
            <label className="font-roboto text-brand-dark-teal text-lg ml-1 font-normal">Организация</label>
            <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-[#EBF7F8] border-none rounded-2xl px-6 py-4 font-roboto text-base outline-none focus:ring-2 focus:ring-brand-accent-teal transition-all" />
          </div>
          <div className="pt-9">
            <button type="submit" className="w-full md:w-auto bg-[#3D828A] text-white px-10 py-4 rounded-2xl font-roboto text-lg hover:bg-opacity-90 transition-all active:scale-[0.98]">
              Отправить заявку на регистрацию
            </button>
          </div>
        </div>
      </form>
      <p className="mt-16 text-[#D94F31] font-roboto text-lg max-w-[1000px]">
        После подтверждения заявки администратором на Вашу почту будут высланы логин и пароль от вашего аккаунта.
      </p>
    </div>
  );
};