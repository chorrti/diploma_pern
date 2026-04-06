export const SearchPanel = () => {
  return (
    <div className="bg-[#E9F3F5] border border-brand-accent-teal rounded-[30px] p-8 mb-10 shadow-[0_6px_0_0_#337D86]">
      <h2 className="font-unbounded text-brand-dark-teal text-xl text-center mb-6 font-normal tracking-tight">
        Поиск по параметрам
      </h2>
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <input 
          type="text" 
          placeholder="Автор/руководитель" 
          className="flex-1 min-w-[200px] bg-transparent border border-brand-accent-teal rounded-full px-6 py-2 font-roboto text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-dark-teal/50"
        />
        <input 
          type="text" 
          placeholder="Тема" 
          className="flex-1 min-w-[150px] bg-transparent border border-brand-accent-teal rounded-full px-6 py-2 font-roboto text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-dark-teal/50"
        />
        <input 
          type="text" 
          placeholder="Название конкурса" 
          className="flex-1 min-w-[200px] bg-transparent border border-brand-accent-teal rounded-full px-6 py-2 font-roboto text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-dark-teal/50"
        />
        {/* Кнопка px-12 теперь заметно шире */}
        <button className="bg-[#C6DDE0] text-brand-dark-teal px-12 py-2 rounded-xl font-roboto font-medium hover:bg-brand-dark-teal hover:text-white transition-all">
          Найти
        </button>
      </div>
    </div>
  );
};