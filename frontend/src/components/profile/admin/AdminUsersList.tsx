import { useState, useEffect } from 'react';
import { AdminSearchBar } from './AdminSearchBar';
import { AdminUserCard } from './AdminUserCard';
import { ConfirmModal } from '../../ConfirmModal';
import { toast } from 'react-hot-toast';
import api from '../../../api/client';

export const AdminUsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (search?: string) => {
    setLoading(true);
    try {
      const url = search ? `/admin/users?search=${encodeURIComponent(search)}` : '/admin/users';
      const response = await api.get(url);
      setUsers(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки:', err.response?.data);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchUsers(value);
  };

  const openDeleteModal = (id: string) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;
    
    try {
      const response = await api.delete(`/admin/users/${selectedUserId}`);
      console.log('Удаление успешно:', response.data);
      toast.success('Пользователь удалён');
      await fetchUsers(searchTerm);
    } catch (err: any) {
      console.error('Ошибка удаления:', err.response?.data);
      toast.error(err.response?.data?.error || 'Ошибка при удалении');
    } finally {
      setIsModalOpen(false);
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-roboto">Загрузка...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">
      <AdminSearchBar onSearch={handleSearch} />

      <div className="space-y-10">
        {users.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-roboto">
            Пользователи не найдены
          </div>
        ) : (
          users.map((u) => (
            <AdminUserCard 
              key={u.id} 
              user={u} 
              onDelete={() => openDeleteModal(u.id)}
            />
          ))
        )}
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