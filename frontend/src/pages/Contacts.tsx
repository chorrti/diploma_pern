export const Contacts = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn font-normal">
      <h1 className="font-unbounded text-brand-dark-teal text-3xl md:text-4xl mb-10">
        Контакты
      </h1>

      <div className="bg-[#FFF2F0] rounded-[40px] p-8 md:p-12 border border-brand-orange shadow-[0_6px_0_0_#F07D58]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-roboto text-brand-red-dark">
          <div className="space-y-6">
            <div>
              <p className="text-sm opacity-60 font-unbounded mb-1">Адрес</p>
              <p className="text-xl">г. Улан-Удэ, ул. Смолина, 24а</p>
            </div>
            <div>
              <p className="text-sm opacity-60 font-unbounded mb-1">Телефон</p>
              <p className="text-xl">+7 (999) 000-00-00</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm opacity-60 font-unbounded mb-1">Электронная почта</p>
              <p className="text-xl">info@portfolio-art.ru</p>
            </div>
            <div>
              <p className="text-sm opacity-60 font-unbounded mb-1">Режим работы</p>
              <p className="text-xl">Пн — Пт: 09:00 - 18:00</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-10 border-t border-brand-orange/20">
          <p className="font-unbounded text-brand-red-dark text-lg mb-4">Техническая поддержка</p>
          <p className="font-roboto text-brand-red-dark opacity-80 max-w-2xl">
            Если у вас возникли вопросы по работе платформы или подаче заявок, 
            пожалуйста, напишите нам на почту с пометкой «Техподдержка».
          </p>
        </div>
      </div>
    </div>
  );
};