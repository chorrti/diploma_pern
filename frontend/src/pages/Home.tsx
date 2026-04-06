import { useState } from 'react';
import { motion } from 'framer-motion';
import { CompetitionCard } from '../components/CompetitionCard';
import { SearchPanel } from '../components/SearchPanel';
import { CategoryFilter } from '../components/CategoryFilter';
import { ExhibitionCard } from '../components/ExhibitionCard';
import { Footer } from '../components/Footer';

export const Home = () => {
  const [activeTab, setActiveTab] = useState('Конкурсы');
  const tabs = ['Конкурсы', 'Результаты', 'Выставка'];
  const categoriesFromDB = ['Все', 'Дизайн', 'Программирование', 'Живопись', 'Скульптура'];
  const [selectedCategory, setSelectedCategory] = useState('Все');

  return (
    <div className="max-w-[1200px] mx-auto px-6 font-normal">
      <div className="relative w-full bg-brand-peach rounded-full p-1 flex mb-10 overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 py-1.5 font-roboto text-xl z-10 transition-colors duration-300 ${
              activeTab === tab ? 'text-white' : 'text-brand-orange'
            }`}
          >
            {activeTab === tab && (
              <motion.div 
                layoutId="active-pill" 
                className="absolute inset-0 bg-brand-orange rounded-full" 
                transition={{ type: "spring", stiffness: 400, damping: 35 }} 
              />
            )}
            <span className="relative z-20">{tab}</span>
          </button>
        ))}
      </div>

      {activeTab === 'Конкурсы' && (
        <CategoryFilter 
          options={categoriesFromDB} 
          selected={selectedCategory}
          onChange={(val) => setSelectedCategory(val)} 
        />
      )}
      
      {activeTab === 'Результаты' && <SearchPanel />}

      <div className="space-y-10 mt-10">
        {activeTab === 'Конкурсы' && (
          <CompetitionCard 
            status="active" // ТИЛОВЫЙ ЦВЕТ + КНОПКА "ПОДАТЬ ЗАЯВКУ"
            title="Конкурс юных художников" 
            start="01.01.2025" 
            end="02.02.2025" 
            results="03.03.2025"
            desc="Уникальная возможность проявить себя в классической живописи. Мы ждем работы, выполненные в любых техниках..." 
          />
        )}

        {activeTab === 'Результаты' && (
          <CompetitionCard 
            status="finished" // ОРАНЖЕВЫЙ ЦВЕТ + КНОПКА "РЕЗУЛЬТАТЫ"
            title="Конкурс под названием название конкурса..." 
            start="01.01.2025" 
            end="02.02.2025" 
            results="03.03.2025"
            desc="Результаты уже доступны для ознакомления. Поздравляем победителей и благодарим всех участников за прекрасные работы!" 
          />
        )}

        {activeTab === 'Выставка' && (
          <>
            <CategoryFilter 
              options={categoriesFromDB} 
              selected={selectedCategory}
              onChange={(val) => setSelectedCategory(val)} 
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <ExhibitionCard 
                  key={item} 
                  author="Бальджинимаева Валерия Зориктуевна" 
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="py-12"></div>
      <Footer />
    </div>
  );
};