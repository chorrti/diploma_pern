import { useState, useEffect } from 'react';
import { fetchThematics } from '../api/contests';
import type { Thematic } from '../api/contests';

interface SearchPanelProps {
    onSearch: (params: SearchParams) => void;
}

export interface SearchParams {
    author: string;
    thematicId: number | null;
    competitionName: string;
}

export const SearchPanel = ({ onSearch }: SearchPanelProps) => {
    const [thematics, setThematics] = useState<Thematic[]>([]);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        author: '',
        thematicId: null,
        competitionName: ''
    });

    // Загружаем тематики для выпадающего списка
    useEffect(() => {
        const loadThematics = async () => {
            try {
                const data = await fetchThematics();
                setThematics(data);
            } catch (error) {
                console.error('Ошибка загрузки тематик:', error);
            }
        };
        loadThematics();
    }, []);

    const handleSearch = () => {
        onSearch(searchParams);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-[#E9F3F5] border border-brand-accent-teal rounded-[30px] p-8 mb-10 shadow-[0_6px_0_0_#337D86]">
            <h2 className="font-unbounded text-brand-dark-teal text-xl text-center mb-6 font-normal tracking-tight">
                Поиск по параметрам
            </h2>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <input 
                    type="text" 
                    placeholder="Автор/руководитель" 
                    value={searchParams.author}
                    onChange={(e) => setSearchParams({...searchParams, author: e.target.value})}
                    onKeyPress={handleKeyPress}
                    className="flex-1 min-w-[200px] bg-transparent border border-brand-accent-teal rounded-full px-6 py-2 font-roboto text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-dark-teal/50"
                />
                
                {/* Выпадающий список для темы */}
                <select
                    value={searchParams.thematicId || ''}
                    onChange={(e) => setSearchParams({
                        ...searchParams, 
                        thematicId: e.target.value ? Number(e.target.value) : null
                    })}
                    className="flex-1 min-w-[150px] bg-transparent border border-brand-accent-teal rounded-full px-6 py-2 font-roboto text-sm outline-none focus:border-brand-orange transition-colors cursor-pointer appearance-none"
                >
                    <option value="">Все темы</option>
                    {thematics.map(thematic => (
                        <option key={thematic.id} value={thematic.id}>
                            {thematic.name}
                        </option>
                    ))}
                </select>
                
                <input 
                    type="text" 
                    placeholder="Название конкурса" 
                    value={searchParams.competitionName}
                    onChange={(e) => setSearchParams({...searchParams, competitionName: e.target.value})}
                    onKeyPress={handleKeyPress}
                    className="flex-1 min-w-[200px] bg-transparent border border-brand-accent-teal rounded-full px-6 py-2 font-roboto text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-dark-teal/50"
                />
                
                <button 
                    onClick={handleSearch}
                    className="bg-[#C6DDE0] text-brand-dark-teal px-12 py-2 rounded-xl font-roboto font-medium hover:bg-brand-dark-teal hover:text-white transition-all"
                >
                    Найти
                </button>
            </div>
        </div>
    );
};