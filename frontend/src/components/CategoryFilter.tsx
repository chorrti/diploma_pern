interface CategoryFilterProps {
  options: string[];
  onChange: (value: string) => void;
  selected?: string;
}

export const CategoryFilter = ({ options, onChange, selected }: CategoryFilterProps) => {
  return (
    <div className="bg-brand-peach border border-brand-orange rounded-[30px] py-4 px-10 flex justify-between items-center mb-10 shadow-[0_4px_0_0_#F07D58]">
      <h2 className="font-unbounded text-brand-red-dark text-xl font-normal">
        Выбор тематики
      </h2>
      <div className="relative w-[40%]">
        <select 
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-none rounded-xl px-6 py-3 appearance-none font-roboto text-brand-red-dark outline-none cursor-pointer text-lg relative z-10 shadow-sm"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-orange font-bold font-unbounded z-20">
          ∨
        </div>
      </div>
    </div>
  );
};