interface AdminUserCardProps {
  user: {
    id: string;
    fio: { last: string; first: string; middle: string };
    email: string;
    phone: string;
    birthDate: string;
    city: string;
    organization: string;
    role: string;
    login: string | null;
  };
  onDelete: () => void;
}

export const AdminUserCard = ({ user, onDelete }: AdminUserCardProps) => {
  // Запрещаем удаление для админа и модератора
  const isProtectedRole = user.role === 'Админ' || user.role === 'Модератор';

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-[12px] font-roboto ml-2 text-[#49A0A5]">{label}</span>
      <div className="bg-white rounded-[10px] h-[40px] px-4 flex items-center font-roboto text-brand-dark-teal shadow-sm border border-[#49A0A5]/10">
        {value || '—'}
      </div>
    </div>
  );

  return (
    <div className="bg-[#EBF7F8] border-2 border-[#49A0A5] rounded-[40px] p-8 md:p-10 shadow-[0_6px_0_0_#49A0A5]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 mb-10">
        <div className="space-y-4">
          <Field label="Фамилия" value={user.fio.last} />
          <Field label="Имя" value={user.fio.first} />
          <Field label="Отчество" value={user.fio.middle} />
          <Field label="Почта" value={user.email} />
          <Field label="Роль" value={user.role} />
        </div>
        <div className="space-y-4">
          <Field label="Дата рождения" value={user.birthDate} />
          <Field label="Телефон" value={user.phone} />
          <Field label="Город" value={user.city} />
          <Field label="Организация" value={user.organization} />
          {user.login && <Field label="Логин" value={user.login} />}
        </div>
      </div>

      <div className="pt-8 border-t border-[#49A0A5] border-opacity-30">
        {!isProtectedRole && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="w-full h-[55px] border-2 border-[#49A0A5] bg-white text-[#49A0A5] rounded-[15px] font-roboto text-lg uppercase hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            Удалить пользователя
          </button>
        )}
      </div>
    </div>
  );
};