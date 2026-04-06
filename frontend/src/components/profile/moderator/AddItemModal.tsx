import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (value: string) => void;
  title: string;
  placeholder: string;
}

export const AddItemModal = ({ isOpen, onClose, onAdd, title, placeholder }: AddItemModalProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-[30px] w-full max-w-[500px] p-10 shadow-2xl z-20"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-brand-dark-teal opacity-50 hover:opacity-100 transition-all text-2xl">✕</button>
            <h3 className="font-unbounded text-xl text-brand-dark-teal mb-8 pr-8 leading-tight">{title}</h3>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full border-2 border-brand-accent-teal/30 rounded-xl px-6 py-4 mb-8 font-roboto text-lg focus:border-brand-accent-teal outline-none transition-all"
            />
            <button 
              onClick={handleSubmit}
              className="w-full bg-brand-accent-teal text-white py-4 rounded-xl font-unbounded text-sm hover:opacity-90 transition-all active:scale-95 shadow-[0_4px_0_0_#337D86]"
            >
              Добавить
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};