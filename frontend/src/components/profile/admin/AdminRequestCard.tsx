import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../api/client';

interface AdminRequestCardProps {
  hasProfile: boolean;
  userData: {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string;
    birthDate: string;
    phone: string;
    email: string;
    city: string;
    organization: string;
    role_id: number;
  };
  onApprove: (creds: { 
    role: string; 
    login: string; 
    password: string; 
    hasProfile: boolean;
    editedData: {
      lastName: string;
      firstName: string;
      middleName: string;
      city: string;
      organization: string;
    }
  }) => void;
  onReject: () => void;
}

export const AdminRequestCard = ({ hasProfile, userData, onApprove, onReject }: AdminRequestCardProps) => {
  const [generatedLogin, setGeneratedLogin] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  // Определяем роль по userData.role_id
  // 1 - Ученик, 2 - Учитель, 3 - Модератор, 4 - Админ
  const getUserRole = () => {
    if (userData.role_id === 1) return 'Ученик';
    if (userData.role_id === 2) return 'Учитель';
    if (userData.role_id === 3) return 'Модератор';
    if (userData.role_id === 4) return 'Админ';
    return 'Ученик';
  };

  const theme = hasProfile
    ? {
        bg: 'bg-[#FFF2F0]',
        border: 'border-[#F07D58]',
        text: 'text-[#F07D58]',
        btn: 'border-[#F07D58] text-[#F07D58] hover:bg-[#F07D58] hover:text-white',
        title: 'У этого пользователя уже есть профиль (ссылка на профиль)'
      }
    : {
        bg: 'bg-[#EBF7F8]',
        border: 'border-[#49A0A5]',
        text: 'text-[#49A0A5]',
        btn: 'border-[#49A0A5] text-[#49A0A5] hover:bg-[#49A0A5] hover:text-white',
        title: 'У этого пользователя нет профиля'
      };

  const handleGenerateCredentials = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post('/register/generate-credentials', {
        email: userData.email
      });

      setGeneratedLogin(response.data.login);
      setGeneratedPassword(response.data.password);
      setShowCreds(true);
      toast.success('Логин и пароль сгенерированы');
    } catch (err) {
      toast.error('Ошибка при генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    if (!generatedLogin || !generatedPassword) {
      toast.error('Сначала сгенерируйте логин и пароль');
      return;
    }
    
    onApprove({ 
      role: getUserRole(),
      login: generatedLogin, 
      password: generatedPassword,
      hasProfile: hasProfile,
      editedData: {
        lastName: userData.lastName,
        firstName: userData.firstName,
        middleName: userData.middleName,
        city: userData.city,
        organization: userData.organization
      }
    });
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 w-full">
      <span className={`text-[12px] font-roboto ml-2 ${theme.text}`}>{label}</span>
      <div className="bg-white rounded-[10px] h-[40px] px-4 flex items-center font-roboto text-brand-dark-teal shadow-sm border border-gray-200">
        {value}
      </div>
    </div>
  );

  return (
    <div className={`${theme.bg} border-2 ${theme.border} rounded-[40px] p-8 shadow-[0_6px_0_0] transition-all mb-8`}>
      <h3 className={`text-center font-roboto text-lg mb-8 uppercase tracking-wide ${theme.text} ${hasProfile ? '' : ''}`}>
        {theme.title}
      </h3>

      <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8">
        <div className="space-y-4">
          <Field label="Фамилия" value={userData.lastName} />
          <Field label="Имя" value={userData.firstName} />
          <Field label="Отчество" value={userData.middleName} />
          <Field label="Почта" value={userData.email} />
          <Field label="Роль" value={getUserRole()} />
        </div>
        <div className="space-y-4">
          <Field label="Дата рождения" value={userData.birthDate} />
          <Field label="Телефон" value={userData.phone} />
          <Field label="Город" value={userData.city} />
          <Field label="Организация" value={userData.organization} />
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <button
          onClick={onReject}
          className={`flex-1 h-[50px] border-2 rounded-[15px] font-roboto transition-all ${theme.btn}`}
        >
          Отклонить заявку
        </button>
        <button
          onClick={handleGenerateCredentials}
          disabled={isGenerating}
          className={`flex-1 h-[50px] border-2 rounded-[15px] font-roboto transition-all ${theme.btn} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? 'Генерация...' : 'Сгенерировать логин'}
        </button>
      </div>

      {showCreds && (
        <div className={`pt-6 border-t ${theme.border} border-opacity-30 mb-6`}>
          <p className={`font-roboto ${theme.text}`}>
            Логин: <span className="font-bold">{generatedLogin}</span>
          </p>
          <p className={`font-roboto ${theme.text}`}>
            Пароль: <span className="font-bold">{generatedPassword}</span>
          </p>
        </div>
      )}

      <button
        onClick={handleApprove}
        className={`w-full h-[55px] border-2 bg-white rounded-[15px] font-roboto text-lg uppercase transition-all ${theme.btn}`}
      >
        {hasProfile ? 'Привязать профиль к пользователю' : 'Одобрить пользователя'}
      </button>
    </div>
  );
};