import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CompetitionCard } from '../components/CompetitionCard';
import { SearchPanel } from '../components/SearchPanel';
import type { SearchParams } from '../components/SearchPanel';
import { CategoryFilter } from '../components/CategoryFilter';
import { ExhibitionCard } from '../components/ExhibitionCard';
import { Footer } from '../components/Footer';
import { fetchThematics, fetchCompetitions } from '../api/contests';
import type { Thematic, Competition } from '../api/contests';
import { formatDate, getFileUrl } from '../utils/formatDate';
import { fetchExhibitionWorks, fetchExhibitionWorkDetails } from '../api/exhibition';
import type { ExhibitionWork, ExhibitionWorkDetails } from '../api/exhibition';
import { searchResults } from '../api/search';
import { MySubmissionModal } from '../components/MySubmissionModal';

interface HomeProps {
  userRole?: string | null;  // ← добавляем пропс userRole
}

export const Home = ({ userRole }: HomeProps) => {
    const [activeTab, setActiveTab] = useState('Конкурсы');
    const tabs = ['Конкурсы', 'Результаты', 'Выставка'];
    
    // Состояния для данных
    const [thematics, setThematics] = useState<Thematic[]>([]);
    const [activeContests, setActiveContests] = useState<Competition[]>([]);
    const [archivedContests, setArchivedContests] = useState<Competition[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [loading, setLoading] = useState({
        thematics: true,
        active: true,
        archived: true,
    });

    // Состояния для выставки
    const [exhibitionWorks, setExhibitionWorks] = useState<ExhibitionWork[]>([]);
    const [selectedWork, setSelectedWork] = useState<ExhibitionWorkDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingExhibition, setLoadingExhibition] = useState(true);

    // Состояния для поиска
    const [searchResultsData, setSearchResultsData] = useState<Competition[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Загружаем тематики при монтировании
    useEffect(() => {
        const loadThematics = async () => {
            try {
                const data = await fetchThematics();
                // Добавляем опцию "Все" в начало
                setThematics([{ id: 0, name: 'Все' }, ...data]);
            } catch (error) {
                console.error('Ошибка загрузки тематик:', error);
            } finally {
                setLoading(prev => ({ ...prev, thematics: false }));
            }
        };
        loadThematics();
    }, []);

    // Загружаем активные конкурсы (при смене тематики)
    useEffect(() => {
        const loadActiveContests = async () => {
            try {
                const thematicId = selectedCategory === 'Все' ? null : 
                    thematics.find(t => t.name === selectedCategory)?.id;
                const data = await fetchCompetitions('open', thematicId);
                setActiveContests(data);
            } catch (error) {
                console.error('Ошибка загрузки активных конкурсов:', error);
            } finally {
                setLoading(prev => ({ ...prev, active: false }));
            }
        };
        
        // Ждём загрузки тематик
        if (thematics.length > 0) {
            loadActiveContests();
        }
    }, [selectedCategory, thematics]);

    // Загружаем конкурсы с результатами (архив)
    useEffect(() => {
        const loadArchivedContests = async () => {
            try {
                const data = await fetchCompetitions('archived');
                setArchivedContests(data);
            } catch (error) {
                console.error('Ошибка загрузки архивных конкурсов:', error);
            } finally {
                setLoading(prev => ({ ...prev, archived: false }));
            }
        };
        loadArchivedContests();
    }, []);

    // Загружаем работы для выставки (при смене тематики)
    useEffect(() => {
        const loadExhibition = async () => {
            setLoadingExhibition(true);
            try {
                const thematicId = selectedCategory === 'Все' ? null : 
                    thematics.find(t => t.name === selectedCategory)?.id;
                const data = await fetchExhibitionWorks(thematicId);
                setExhibitionWorks(data);
            } catch (error) {
                console.error('Ошибка загрузки выставки:', error);
            } finally {
                setLoadingExhibition(false);
            }
        };
        
        if (thematics.length > 0) {
            loadExhibition();
        }
    }, [selectedCategory, thematics]);

    // Сброс поиска при переключении вкладки
    useEffect(() => {
        if (activeTab !== 'Результаты') {
            setSearchResultsData([]);
            setIsSearching(false);
            setSearchPerformed(false);
        }
    }, [activeTab]);

    // Функция поиска
    const handleSearch = async (params: SearchParams) => {
        setIsSearching(true);
        setSearchPerformed(true);
        try {
            const results = await searchResults(params);
            setSearchResultsData(results);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            setSearchResultsData([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Открытие модального окна с деталями работы
    const handleWorkClick = async (workId: number) => {
        try {
            const details = await fetchExhibitionWorkDetails(workId);
            setSelectedWork(details);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Ошибка загрузки деталей работы:', error);
        }
    };

    // Подготовка опций для CategoryFilter
    const categoryOptions = thematics.map(t => t.name);

    // Рендер карточек конкурсов
    const renderCompetitionCards = (contests: Competition[], status: 'active' | 'finished') => {
        if (contests.length === 0) {
            return <p className="text-center text-gray-500 py-10">Нет конкурсов</p>;
        }
        
        return contests.map(contest => (
            <CompetitionCard
                key={contest.id}
                id={contest.id}
                status={status}
                title={contest.name}
                start={formatDate(contest.startDate)}
                end={formatDate(contest.endDate)}
                results={formatDate(contest.resultsDate)}
                desc={contest.description}
                regulationUrl={getFileUrl(contest.regulationFilePath)}
                userRole={userRole}  // ← передаём роль в карточку
            />
        ));
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 font-normal">
            <Helmet>
                <title>Главная | Платформа конкурсов</title>
            </Helmet>

            {/* Вкладки */}
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

            {/* Контент вкладки "Конкурсы" */}
            {activeTab === 'Конкурсы' && (
                <CategoryFilter 
                    options={categoryOptions} 
                    selected={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)} 
                />
            )}
            
            {/* Контент вкладки "Результаты" */}
            {activeTab === 'Результаты' && (
                <SearchPanel onSearch={handleSearch} />
            )}

            {/* Список карточек */}
            <div className="space-y-10 mt-10">
                {activeTab === 'Конкурсы' && renderCompetitionCards(activeContests, 'active')}
                
                {activeTab === 'Результаты' && (
                    <>
                        {isSearching ? (
                            <p className="text-center text-gray-500 py-20">Поиск...</p>
                        ) : searchPerformed && searchResultsData.length === 0 ? (
                            <p className="text-center text-gray-500 py-20">По вашему запросу ничего не найдено</p>
                        ) : (
                            renderCompetitionCards(
                                searchResultsData.length > 0 ? searchResultsData : archivedContests, 
                                'finished'
                            )
                        )}
                    </>
                )}
                
                {/* Выставка */}
                {activeTab === 'Выставка' && (
                    <>
                        <CategoryFilter 
                            options={categoryOptions} 
                            selected={selectedCategory}
                            onChange={(val) => setSelectedCategory(val)} 
                        />
                        {loadingExhibition ? (
                            <p className="text-center text-gray-500 py-20">Загрузка...</p>
                        ) : exhibitionWorks.length === 0 ? (
                            <p className="text-center text-gray-500 py-20">Нет работ на выставке</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                                {exhibitionWorks.map((work) => (
                                    <ExhibitionCard 
                                        key={work.id}
                                        author={work.author}
                                        city={work.city}
                                        image={work.imageUrl}
                                        onClick={() => handleWorkClick(work.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="py-12"></div>
            <Footer />

            {/* Модальное окно с деталями работы */}
            <MySubmissionModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedWork(null);
                }}
                workDetails={selectedWork}
            />
        </div>
    );
};