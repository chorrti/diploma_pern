import { ModeratorContestCard } from './ModeratorContestCard';

export const ModeratorResults = () => {
  // Имитация завершенных конкурсов
  const resultsData = [
    {
      id: "contest-101",
      title: "Международный конкурс рисунка «Мир глазами детей»",
      start: "01.09.2025",
      end: "01.12.2025",
      results: "15.12.2025",
      desc: "Конкурс завершен. Все заявки собраны. Необходимо провести финальную компиляцию для жюри и опубликовать итоговые протоколы."
    },
    {
      id: "contest-102",
      title: "Выставка-конкурс «Техно-Арт 2025»",
      start: "10.10.2025",
      end: "20.12.2025",
      results: "30.12.2025",
      desc: "Работы проходят модерацию. Сформируйте списки для экспертной оценки."
    }
  ];

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1">
        {resultsData.map((contest) => (
          <ModeratorContestCard 
            key={contest.id}
            {...contest}
            isResults={true}
            onAction1={() => console.log('Запуск компиляции для жюри:', contest.id)}
            onAction2={() => console.log('Публикация результатов:', contest.id)}
          />
        ))}
      </div>
    </div>
  );
};