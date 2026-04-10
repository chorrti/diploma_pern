interface ProfileInfoProps {
  data: {
    fio: string;
    birthDate: string;
    city: string;
    email: string;
    phone: string;
    organization: string;
  }
}

export const ProfileInfo = ({ data }: ProfileInfoProps) => {
  return (
    <div className="bg-[#EBF7F8] rounded-[40px] p-10 md:p-14 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-8 font-roboto text-xl text-brand-dark-teal">
        <div className="space-y-6">
          <p><span className="opacity-60">ФИО:</span> {data.fio}</p>
          <p><span className="opacity-60">Дата рождения:</span> {data.birthDate}</p>
          <p><span className="opacity-60">Город:</span> {data.city}</p>
        </div>
        <div className="space-y-6 md:text-right">
          <p><span className="opacity-60">Почта:</span> {data.email}</p>
          <p><span className="opacity-60">Телефон:</span> {data.phone}</p>
          <p><span className="opacity-60">Организация:</span> {data.organization}</p>
        </div>
      </div>
    </div>
  );
};