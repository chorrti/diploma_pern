import { useState, useEffect } from 'react';
import { AdminSearchBar } from './AdminSearchBar';
import { AdminUserCard } from './AdminUserCard';
import { ConfirmModal } from '../../ConfirmModal';

export const AdminUsersList = () => {
  const [users, setUsers] = useState<any[]>([]); // Тут будут данные из БД
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ИМИТАЦИЯ ПОДГРУЗКИ ИЗ БД
  useEffect(() => {
    // В будущем: fetch('/api/users').then(res => res.json()).then(data => setUsers(data))
    const mockData = [
      { 
        id: '1', 
        fio: { last: 'Иванов', first: 'Иван', middle: 'Иванович' }, 
        email: 'ivan@test.ru', 
        role: 'Учитель',
        birthDate: '01.01.1980',
        phone: '+7 (999) 000-11-22',
        city: 'Москва',
        organization: 'МБОУ СОШ №1500'
      },
      { 
        id: '2', 
        fio: { last: 'Сидоров', first: 'Сидор', middle: 'Сидорович' }, 
        email: 'sidor@test.ru', 
        role: 'Ученик',
        birthDate: '10.05.2010',
        phone: '+7 (999) 444-55-66',
        city: 'Самара',
        organization: 'МАОУ Лицей №1'
      }
    ];
    setUsers(mockData);
  }, []);

  // Просто открываем модалку для верстки
  const openDeleteModal = (id: string) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Тут будет запрос к БД: DELETE /api/users/" + selectedUserId);
    // Для фронта — просто закрываем
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">
      <AdminSearchBar onSearch={(v) => console.log('Поиск:', v)} />

      <div className="space-y-10">
        {users.map((u) => (
          <AdminUserCard 
            key={u.id} 
            user={u} 
            onDelete={() => openDeleteModal(u.id)} // Важно: вызываем функцию открытия
          />
        ))}
      </div>

      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Вы уверены, что хотите\nудалить пользователя?`}
      />
    </div>
  );
};