import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../../ConfirmModal';
import { AddItemModal } from './AddItemModal';
import { fetchDegrees, addDegree, deleteDegree, fetchThematics, addThematic, deleteThematic } from '../../../api/dictionaries';
import type { Degree, Thematic } from '../../../api/dictionaries';

export const ModeratorSettings = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [thematics, setThematics] = useState<Thematic[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: 'degree' | 'theme' | null; id: number | null; name: string }>({
    open: false, type: null, id: null, name: ''
  });

  const [addModal, setAddModal] = useState<{ open: boolean; type: 'degree' | 'theme' | null }>({
    open: false, type: null
  });

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const [degreesData, thematicsData] = await Promise.all([
          fetchDegrees(),
          fetchThematics()
        ]);
        setDegrees(degreesData);
        setThematics(thematicsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        toast.error('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAdd = async (value: string) => {
    try {
      if (addModal.type === 'degree') {
        const newDegree = await addDegree(value);
        setDegrees(prev => [...prev, newDegree]);
        toast.success('Степень добавлена');
      } else if (addModal.type === 'theme') {
        const newThematic = await addThematic(value);
        setThematics(prev => [...prev, newThematic]);
        toast.success('Тематика добавлена');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Ошибка при добавлении');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      if (deleteModal.type === 'degree') {
        await deleteDegree(deleteModal.id);
        setDegrees(prev => prev.filter(d => d.id !== deleteModal.id));
        toast.success('Степень удалена');
      } else if (deleteModal.type === 'theme') {
        await deleteThematic(deleteModal.id);
        setThematics(prev => prev.filter(t => t.id !== deleteModal.id));
        toast.success('Тематика удалена');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Ошибка при удалении');
    }
    
    setDeleteModal({ open: false, type: null, id: null, name: '' });
  };

  if (loading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn">
      {/* СЕКЦИЯ СТЕПЕНЕЙ */}
      <div className="space-y-6">
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setAddModal({ open: true, type: 'degree' })}
          className="w-full bg-brand-orange text-white py-5 rounded-2xl font-unbounded text-sm uppercase tracking-wider shadow-[0_6px_0_0_#F07D58] mb-4"
        >
          Добавить степень диплома
        </motion.button>
        
        {degrees.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Нет степеней</p>
        ) : (
          degrees.map((item) => (
            <motion.div 
              key={item.id} whileHover={{ y: -5 }}
              className="flex justify-between items-center bg-white border border-brand-orange rounded-2xl px-8 py-5 shadow-[0_6px_0_0_#F07D58]"
            >
              <span className="font-unbounded text-brand-orange text-lg font-normal">{item.name}</span>
              <button 
                onClick={() => setDeleteModal({ open: true, type: 'degree', id: item.id, name: item.name })}
                className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all active:scale-90 shadow-md"
              >✕</button>
            </motion.div>
          ))
        )}
      </div>

      {/* СЕКЦИЯ ТЕМАТИК */}
      <div className="space-y-6">
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setAddModal({ open: true, type: 'theme' })}
          className="w-full bg-[#4A8F97] text-white py-5 rounded-2xl font-unbounded text-sm uppercase tracking-wider shadow-[0_6px_0_0_#337D86] mb-4"
        >
          Добавить тематику конкурса
        </motion.button>
        
        {thematics.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Нет тематик</p>
        ) : (
          thematics.map((item) => (
            <motion.div 
              key={item.id} whileHover={{ y: -5 }}
              className="flex justify-between items-center bg-brand-light-teal border border-brand-accent-teal rounded-2xl px-8 py-5 shadow-[0_6px_0_0_#337D86]"
            >
              <span className="font-unbounded text-brand-dark-teal text-lg font-normal">{item.name}</span>
              <button 
                onClick={() => setDeleteModal({ open: true, type: 'theme', id: item.id, name: item.name })}
                className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all active:scale-90 shadow-md"
              >✕</button>
            </motion.div>
          ))
        )}
      </div>

      {/* МОДАЛКА ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ */}
      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, id: null, name: '' })}
        onConfirm={handleDelete}
        title={deleteModal.type === 'degree' 
          ? `Вы уверены, что хотите удалить степень "${deleteModal.name}"?` 
          : `Вы уверены, что хотите удалить тематику "${deleteModal.name}"?`
        }
      />

      {/* МОДАЛКА ДОБАВЛЕНИЯ */}
      <AddItemModal 
        isOpen={addModal.open}
        onClose={() => setAddModal({ open: false, type: null })}
        title={addModal.type === 'degree' ? "Новая степень диплома" : "Новая тематика конкурса"}
        placeholder="Введите название..."
        onAdd={handleAdd}
      />
    </div>
  );
};