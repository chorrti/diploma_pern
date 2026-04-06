import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Импортируем навигацию
import { ModeratorContestCard } from './ModeratorContestCard';

export const ModeratorContests = () => {
  const navigate = useNavigate(); // Инициализируем

  const contests = [
    {
      id: 1,
      title: "Конкурс под названием названием названием названием названием названием..................",
      start: "01.01.2025",
      end: "02.02.2025",
      results: "03.03.2025",
      desc: "During the initial consultation, we will discuss your business goals and objectives..."
    },
    {
      id: 2,
      title: "Еще один активный конкурс без капса в заголовке",
      start: "15.02.2025",
      end: "20.03.2025",
      results: "25.03.2025",
      desc: "Описание второго конкурса для проверки верстки и отступов между карточками."
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-center mb-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          // ПЕРЕХОД: Просто на страницу создания
          onClick={() => navigate('/contest/edit')}
          className="bg-brand-accent-teal text-white px-12 py-4 rounded-2xl font-unbounded text-sm hover:opacity-90 transition-all uppercase tracking-wider font-normal shadow-[0_6px_0_0_#337D86] active:translate-y-[2px] active:shadow-none"
        >
          Создать новый конкурс
        </motion.button>
      </div>

      <div className="grid grid-cols-1">
        {contests.map((contest) => (
          <ModeratorContestCard 
            key={contest.id}
            {...contest}
            isResults={false}
            onAction1={() => console.log('Компиляция заявок для:', contest.id)}
          />
        ))}
      </div>
    </div>
  );
};