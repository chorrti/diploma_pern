import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { ResultsModal } from '../components/ResultsModal';
import { ContestForm } from '../components/ContestForm';
import { MySubmissionModal } from '../components/MySubmissionModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { fetchCompetitionById } from '../api/contests';
import type { Competition } from '../api/contests';
import { formatDate, getFileUrl } from '../utils/formatDate';

interface ContestPageProps {
  userRole: string | null;
}

export const ContestPage = ({ userRole }: ContestPageProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const contestId = searchParams.get('id');
  const status = searchParams.get('status');
  const action = searchParams.get('action');

  const [contest, setContest] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Функция проверки, может ли пользователь подать заявку
  const canApply = () => {
    if (!userRole) return false;
    return userRole === 'Ученик' || userRole === 'Учитель';
  };

  // Обработчик нажатия на кнопку "Подать заявку"
  const handleApplyClick = () => {
    if (!userRole) {
      toast.error('Для подачи заявки необходимо войти в систему');
      return;
    }
    
    if (!canApply()) {
      toast.error('Вы не можете подать заявку. Нужна роль "Ученик" или "Учитель"');
      return;
    }
    
    if (hasSubmitted) {
      setIsSubmissionModalOpen(true);
    } else {
      setIsFormOpen(true);
    }
  };

  useEffect(() => {
    if (!contestId) {
      setError('ID конкурса не указан');
      setLoading(false);
      return;
    }

    const loadContest = async () => {
      try {
        const data = await fetchCompetitionById(parseInt(contestId));
        setContest(data);
      } catch (err) {
        console.error('Ошибка загрузки конкурса:', err);
        setError('Не удалось загрузить данные конкурса');
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId]);

  useEffect(() => {
    if (!contest) return;
    
    if (action === 'apply') {
      if (!userRole) {
        toast.error('Для подачи заявки необходимо войти в систему');
      } else if (!canApply()) {
        toast.error('Вы не можете подать заявку. Нужна роль "Ученик" или "Учитель"');
      } else {
        setIsFormOpen(true);
      }
    }
    if (action === 'results') setIsResultsModalOpen(true);
    if (action === 'view') setIsSubmissionModalOpen(true);
  }, [action, contest, userRole]);

  const isFinished = status === 'finished' || contest?.status === 'archived';
  const isModerator = userRole === 'Модератор';

  const handleDeleteConfirm = () => {
    console.log('Конкурс удален', contestId);
    navigate('/');
  };

  const handleRegulationClick = () => {
    if (contest?.regulationFilePath) {
      window.open(getFileUrl(contest.regulationFilePath), '_blank');
    }
  };

  // Определяем заголовок для Helmet
  const pageTitle = loading 
    ? 'Загрузка... | Платформа конкурсов' 
    : error || !contest 
      ? 'Конкурс не найден | Платформа конкурсов' 
      : `${contest.name} | Платформа конкурсов`;

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <p className="text-center text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <p className="text-center text-red-500">{error || 'Конкурс не найден'}</p>
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-brand-dark-teal text-white rounded-xl"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn font-normal">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <h1 className="font-unbounded text-brand-dark-teal text-3xl md:text-4xl leading-tight mb-10">
        {contest.name}
      </h1>

      <div className="bg-[#EBF7F8] rounded-[40px] p-8 md:p-12 mb-10 border border-brand-accent-teal/10">
        <p className="font-roboto text-brand-dark-teal text-lg mb-10 opacity-80 leading-relaxed">
          {contest.description || 'Описание отсутствует'}
        </p>
        <div className="space-y-2 font-unbounded text-xl text-brand-dark-teal">
          <p>Начало: {formatDate(contest.startDate)}</p>
          <p>Конец: {formatDate(contest.endDate)}</p>
          <p>Результаты: {formatDate(contest.resultsDate)}</p>
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        {!isFormOpen ? (
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-[900px] justify-center items-center">
            <button 
              onClick={handleRegulationClick}
              className="w-full md:flex-1 py-4 border-2 border-brand-dark-teal text-brand-dark-teal rounded-2xl font-unbounded text-lg hover:bg-brand-dark-teal hover:text-white transition-all font-normal"
            >
              Положение
            </button>
            
            {isFinished ? (
              <button 
                onClick={() => setIsResultsModalOpen(true)} 
                className="w-full md:flex-1 py-4 bg-[#3D828A] text-white rounded-2xl font-unbounded text-lg shadow-lg hover:bg-opacity-90 transition-all font-normal"
              >
                Результаты
              </button>
            ) : (
              <>
                {isModerator ? (
                  <>
                    <button 
                      onClick={() => navigate(`/contest/edit?mode=edit&id=${contestId}`)}
                      className="w-full md:flex-1 py-4 bg-[#F07D58] text-white rounded-2xl font-unbounded text-lg shadow-lg hover:bg-opacity-90 transition-all font-normal"
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="w-full md:flex-1 py-4 border-2 border-brand-red-dark text-brand-red-dark rounded-2xl font-unbounded text-lg hover:bg-brand-red-dark hover:text-white transition-all font-normal"
                    >
                      Удалить
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleApplyClick}
                    className={`w-full md:flex-1 py-4 text-white rounded-2xl font-unbounded text-lg shadow-lg transition-all font-normal ${
                      userRole && hasSubmitted ? 'bg-[#F07D58]' : 'bg-[#3D828A]'
                    }`}
                  >
                    {userRole && hasSubmitted ? 'Моя заявка' : 'Подать заявку'}
                  </button>
                )}
              </>
            )}
            
            {isModerator && isFinished && (
              <button 
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="w-full md:flex-1 py-4 border-2 border-brand-red-dark text-brand-red-dark rounded-2xl font-unbounded text-lg hover:bg-brand-red-dark hover:text-white transition-all font-normal"
              >
                Удалить
              </button>
            )}
          </div>
        ) : (
          <div className="w-full space-y-10">
            <div className="flex justify-center">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-full md:max-w-[380px] py-4 border-2 border-brand-dark-teal text-brand-dark-teal rounded-2xl font-unbounded text-lg hover:bg-brand-dark-teal hover:text-white transition-all font-normal"
              >
                Назад к описанию
              </button>
            </div>
            <h2 className="font-unbounded text-3xl text-brand-red-dark text-center uppercase tracking-wider font-normal">Заявка на конкурс</h2>
            <ContestForm 
              userRole={userRole} 
              contestId={parseInt(contestId!)}
              onSuccess={() => { setHasSubmitted(true); setIsFormOpen(false); }} 
            />
          </div>
        )}
      </div>

      <ResultsModal 
        isOpen={isResultsModalOpen} 
        onClose={() => setIsResultsModalOpen(false)} 
        contestTitle={contest.name} 
        competitionId={contest.id}
      />
      
      <MySubmissionModal 
        isOpen={isSubmissionModalOpen} 
        onClose={() => setIsSubmissionModalOpen(false)} 
      />

      <ConfirmModal 
        isOpen={isConfirmDeleteOpen} 
        onClose={() => setIsConfirmDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm}
        title="Вы уверены, что хотите удалить этот конкурс?" 
      />
    </div>
  );
};