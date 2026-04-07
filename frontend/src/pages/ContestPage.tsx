import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResultsModal } from '../components/ResultsModal';
import { ContestForm } from '../components/ContestForm';
import { MySubmissionModal } from '../components/MySubmissionModal';
import { ConfirmModal } from '../components/ConfirmModal'; // Импортируем модалку

export const ContestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userRole = searchParams.get('role'); 
  const status = searchParams.get('status');
  const action = searchParams.get('action');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); // Состояние для удаления
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (action === 'apply') setIsFormOpen(true);
    if (action === 'results') setIsResultsModalOpen(true);
    if (action === 'view') setIsSubmissionModalOpen(true);
  }, [action]);

  const isFinished = status === 'finished';
  const isStudent = userRole === 'student' || !userRole;
  const isModerator = userRole === 'moderator';

  const handleDeleteConfirm = () => {
    console.log('Конкурс удален');
    navigate('/'); // Уводим на главную после удаления
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn font-normal">
      <h1 className="font-unbounded text-brand-dark-teal text-3xl md:text-4xl leading-tight mb-10">
        Конкурс под названием названием названием названием.......
      </h1>

      <div className="bg-[#EBF7F8] rounded-[40px] p-8 md:p-12 mb-10 border border-brand-accent-teal/10">
        <p className="font-roboto text-brand-dark-teal text-lg mb-10 opacity-80 leading-relaxed">
          Полное описание конкурса, которое объясняет суть...
        </p>
        <div className="space-y-2 font-unbounded text-xl text-brand-dark-teal">
          <p>Начало: 01.01.2025</p>
          <p>Конец: 02.02.2025</p>
          <p>Результаты: 03.03.2025</p>
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        {!isFormOpen ? (
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-[900px] justify-center items-center">
            <button className="w-full md:flex-1 py-4 border-2 border-brand-dark-teal text-brand-dark-teal rounded-2xl font-unbounded text-lg hover:bg-brand-dark-teal hover:text-white transition-all font-normal">
              Положение
            </button>
            
            {/* Если конкурс завершен, все видят кнопку Результаты */}
            {isFinished ? (
              <button 
                onClick={() => setIsResultsModalOpen(true)} 
                className="w-full md:flex-1 py-4 bg-[#3D828A] text-white rounded-2xl font-unbounded text-lg shadow-lg hover:bg-opacity-90 transition-all font-normal"
              >
                Результаты
              </button>
            ) : (
              /* Если конкурс НЕ завершен, показываем кнопки в зависимости от роли */
              <>
                {isModerator ? (
                  <>
                    <button 
                      onClick={() => navigate('/contest/edit?mode=edit')}
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
                    onClick={() => isStudent && hasSubmitted ? setIsSubmissionModalOpen(true) : setIsFormOpen(true)}
                    className={`w-full md:flex-1 py-4 text-white rounded-2xl font-unbounded text-lg shadow-lg transition-all font-normal ${
                      isStudent && hasSubmitted ? 'bg-[#F07D58]' : 'bg-[#3D828A]'
                    }`}
                  >
                    {isStudent && hasSubmitted ? 'Моя заявка' : 'Подать заявку'}
                  </button>
                )}
              </>
            )}
            
            {/* Кнопка Удалить для модератора остается доступной даже при завершенном конкурсе */}
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
              onSuccess={() => { setHasSubmitted(true); setIsFormOpen(false); }} 
            />
          </div>
        )}
      </div>

      <ResultsModal 
        isOpen={isResultsModalOpen} 
        onClose={() => setIsResultsModalOpen(false)} 
        contestTitle="Конкурс..." 
      />
      
      <MySubmissionModal 
        isOpen={isSubmissionModalOpen} 
        onClose={() => setIsSubmissionModalOpen(false)} 
      />

      <ConfirmModal 
        isOpen={isConfirmDeleteOpen} 
        onClose={() => setIsConfirmDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm}
        title={`Вы уверены, что хотите\nудалить этот конкурс?`} 
      />
    </div>
  );
};