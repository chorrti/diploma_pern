import { useState } from 'react';
import { ModeratorExhibitionCard } from './ModeratorExhibitionCard';
import { MySubmissionModal } from '../../MySubmissionModal';

export const ModeratorExhibition = () => {
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Имитация данных заявок
  const exhibitionData = [
    {
      id: 1,
      workTitle: "Название работы",
      author: "Бальджинимаева Валерия Зориктуевна",
      description: "Описание работы описание работыОписание работы описание работыОписание работы описание работы описание работыОписание работы описание работы",
      contestTitle: "Конкурс под названием названием названием названием названием названием названием..................",
      // Данные для модалки
      link: "https://disk.yandex.ru/d/example-1",
      organization: "Школа №1",
      city: "Самара",
      boss: "Петров П.П."
    },
    {
      id: 2,
      workTitle: "Зимний пейзаж",
      author: "Иванов Иван Иванович",
      description: "Описание второй работы для проверки списка заявок на модерацию выставки.",
      contestTitle: "Конкурс «Краски зимы 2025»",
      link: "https://disk.yandex.ru/d/example-2",
      organization: "Лицей №4",
      city: "Тольятти",
      boss: "Сидорова А.А."
    }
  ];

  const handleOpenModal = (work: any) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1">
        {exhibitionData.map((item) => (
          <ModeratorExhibitionCard 
            key={item.id}
            workTitle={item.workTitle}
            author={item.author}
            description={item.description}
            contestTitle={item.contestTitle}
            onOpen={() => handleOpenModal(item)}
            onApprove={() => console.log('Одобрено:', item.id)}
            onReject={() => console.log('Отклонено:', item.id)}
          />
        ))}
      </div>

      {/* Модальное окно с данными выбранной работы */}
      <MySubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        // В реальном приложении данные прокидываются через пропсы в MySubmissionModal
        // Сейчас модалка использует свои внутренние статические данные, 
        // но логика открытия/закрытия готова.
      />
    </div>
  );
};