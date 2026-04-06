import { useState } from 'react';

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
  onApprove: (creds: { login: string; pass: string; roleId: number }) => void;
  onReject: () => void;
}

export const AdminRequestCard = ({ hasProfile, userData, onApprove, onReject }: AdminRequestCardProps) => {
  const [showCreds, setShowCreds] = useState(false);
  const [creds, setCreds] = useState({ login: '', pass: '' });

  // Тема меняется в зависимости от наличия профиля
  const theme = hasProfile 
    ? {
        bg: 'bg-[#FFF2F0]', // Светло-оранжевый фон
        border: 'border-[#F07D58]', // Оранжевая рамка
        text: 'text-[#F07D58]', // Оранжевый текст заголовков
        btn: 'border-[#F07D58] text-[#F07D58] hover:bg-[#F07D58] hover:text-white',
        title: 'У этого пользователя уже есть профиль'
      }
    : {
        bg: 'bg-[#EBF7F8]', // Твоя стандартная бирюза
        border: 'border-[#49A0A5]',
        text: 'text-[#49A0A5]',
        btn: 'border-[#49A0A5] text-[#49A0A5] hover:bg-[#49A0A5] hover:text-white',
        title: 'У этого пользователя нет профиля'
      };

  const generateCredentials = () => {
    // Генерация полностью случайных строк
    const randomStr = () => Math.random().toString(36).slice(-8);
    setCreds({ login: randomStr(), pass: randomStr() });
    setShowCreds(true);
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 w-full">
      <span className={`text-[12px] font-roboto ml-2 ${theme.text}`}>{label}</span>
      <div className="bg-white rounded-[10px] h-[40px] px-4 flex items-center font-roboto text-brand-dark-teal shadow-sm border border-transparent">
        {value}
      </div>
    </div>
  );

  return (
    <div className={`${theme.bg} border-2 ${theme.border} rounded-[40px] p-8 shadow-[0_6px_0_0] transition-all mb-8`}>
      <h3 className={`text-center font-roboto text-lg mb-8 uppercase tracking-wide ${theme.text} ${hasProfile ? 'underline cursor-pointer' : ''}`}>
        {theme.title}
      </h3>

      <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8">
        <div className="space-y-4">
          <Field label="Фамилия" value={userData.lastName} />
          <Field label="Имя" value={userData.firstName} />
          <Field label="Отчество" value={userData.middleName} />
          <Field label="Почта" value={userData.email} />
          
          {/* Роль теперь просто текстовое поле без возможности выбора */}
          <Field label="Роль" value={userData.role_id === 1 ? 'Ученик' : 'Учитель'} />
        </div>

        <div className="space-y-4">
          <Field label="Дата рождения" value={userData.birthDate} />
          <Field label="Телефон" value={userData.phone} />
          <Field label="Город" value={userData.city} />
          <Field label="Организация" value={userData.organization} />
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <button onClick={onReject} className={`flex-1 h-[50px] border-2 rounded-[15px] font-roboto transition-all ${theme.btn}`}>
          Отклонить заявку
        </button>
        {/* Если профиль есть, логин генерировать не нужно, он уже существует в системе */}
        {!hasProfile && (
          <button onClick={generateCredentials} className={`flex-1 h-[50px] border-2 rounded-[15px] font-roboto transition-all ${theme.btn}`}>
            Сгенерировать логин
          </button>
        )}
      </div>

      {!hasProfile && (
        <div className={`pt-6 border-t ${theme.border} border-opacity-30 mb-6`}>
          <p className={`font-roboto ${theme.text}`}>Логин: <span className="font-bold text-brand-dark-teal">{showCreds ? creds.login : ''}</span></p>
          <p className={`font-roboto ${theme.text}`}>Пароль: <span className="font-bold text-brand-dark-teal">{showCreds ? creds.pass : ''}</span></p>
        </div>
      )}

      <button 
        onClick={() => onApprove({ ...creds, roleId: userData.role_id })}
        disabled={!hasProfile && !showCreds}
        className={`w-full h-[55px] border-2 bg-white rounded-[15px] font-roboto text-lg uppercase transition-all disabled:opacity-30 ${theme.btn}`}
      >
        {hasProfile ? 'Привязать профиль к пользователю' : 'Одобрить пользователя'}
      </button>
    </div>
  );
};