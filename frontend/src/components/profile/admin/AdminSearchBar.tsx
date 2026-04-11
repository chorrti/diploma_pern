import { useState } from 'react';

interface AdminSearchBarProps {
  onSearch: (value: string) => void;
}

export const AdminSearchBar = ({ onSearch }: AdminSearchBarProps) => {
  const [value, setValue] = useState('');

  const handleSearch = () => {
    onSearch(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-[#FFF2F0] border-2 border-[#F07D58] rounded-[30px] p-5 shadow-[0_6px_0_0_#F07D58] flex flex-col md:flex-row gap-4 items-center mb-12">
      <div className="flex-1 bg-white rounded-[15px] h-[50px] px-6 flex items-center shadow-inner w-full">
        <input 
          type="text" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Поиск по параметру"
          className="w-full bg-transparent border-none outline-none font-roboto text-brand-dark-teal text-lg placeholder:opacity-40"
        />
      </div>
      <button 
        type="button"
        onClick={handleSearch}
        className="w-full md:w-auto bg-[#F07D58] text-white px-16 h-[50px] rounded-[15px] font-roboto text-lg hover:bg-opacity-90 transition-all active:scale-95 shadow-md"
      >
        Найти
      </button>
    </div>
  );
};