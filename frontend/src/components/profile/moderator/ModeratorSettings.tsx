import { useState } from 'react';
import { motion } from 'framer-motion';
import { ConfirmModal } from '../../ConfirmModal';
import { AddItemModal } from './AddItemModal';

export const ModeratorSettings = () => {
  const [degrees, setDegrees] = useState(['Диплом I степени', 'Диплом II степени']);
  const [themes, setThemes] = useState(['Живопись', 'Графика', 'Архитектура']);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: 'degree' | 'theme' | null; index: number }>({
    open: false, type: null, index: -1
  });

  const [addModal, setAddModal] = useState<{ open: boolean; type: 'degree' | 'theme' | null }>({
    open: false, type: null
  });

  const handleDelete = () => {
    if (deleteModal.type === 'degree') {
      setDegrees(degrees.filter((_, i) => i !== deleteModal.index));
    } else {
      setThemes(themes.filter((_, i) => i !== deleteModal.index));
    }
    setDeleteModal({ open: false, type: null, index: -1 });
  };

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
        {degrees.map((item, index) => (
          <motion.div 
            key={index} whileHover={{ y: -5 }}
            className="flex justify-between items-center bg-white border border-brand-orange rounded-2xl px-8 py-5 shadow-[0_6px_0_0_#F07D58]"
          >
            <span className="font-unbounded text-brand-orange text-lg font-normal">{item}</span>
            <button 
              onClick={() => setDeleteModal({ open: true, type: 'degree', index })}
              className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all active:scale-90 shadow-md"
            >✕</button>
          </motion.div>
        ))}
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
        {themes.map((item, index) => (
          <motion.div 
            key={index} whileHover={{ y: -5 }}
            className="flex justify-between items-center bg-brand-light-teal border border-brand-accent-teal rounded-2xl px-8 py-5 shadow-[0_6px_0_0_#337D86]"
          >
            <span className="font-unbounded text-brand-dark-teal text-lg font-normal">{item}</span>
            <button 
              onClick={() => setDeleteModal({ open: true, type: 'theme', index })}
              className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all active:scale-90 shadow-md"
            >✕</button>
          </motion.div>
        ))}
      </div>

      {/* МОДАЛКИ */}
      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, index: -1 })}
        onConfirm={handleDelete}
        title={deleteModal.type === 'degree' ? "Удалить степень?" : "Удалить тематику?"}
      />

      <AddItemModal 
        isOpen={addModal.open}
        onClose={() => setAddModal({ open: false, type: null })}
        title={addModal.type === 'degree' ? "Новая степень диплома" : "Новая тематика конкурса"}
        placeholder="Введите название..."
        onAdd={(val) => addModal.type === 'degree' ? setDegrees([...degrees, val]) : setThemes([...themes, val])}
      />
    </div>
  );
};