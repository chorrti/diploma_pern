import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StudentCard } from './StudentCard';

export const TeacherProfile = () => {
  const navigate = useNavigate();

  // Имитация данных (потом этот массив придет из props или Redux/Context)
  const students = [
    { id: 1, fio: "Бальджинимаева Валерия Зориктуевна", email: "valeria.b@mail.ru", phone: "+7 (999) 000-00-01" },
    { id: 2, fio: "Иванов Иван Иванович", email: "ivanov.i@mail.ru", phone: "+7 (999) 000-00-02" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto font-normal">
      {/* КНОПКА СОЗДАНИЯ */}
      <div className="flex justify-center mb-12">
        <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/create-student')} 
        className="bg-brand-orange text-white px-12 py-4 rounded-2xl font-unbounded text-sm hover:opacity-90 transition-all uppercase tracking-wider font-normal active:scale-95"
      >
        Создать профиль ученика
      </motion.button>
      </div>

      {/* СПИСОК УЧЕНИКОВ */}
      <div className="space-y-6">
        {students.map((student) => (
          <StudentCard key={student.id} {...student} />
        ))}
      </div>
    </div>
  );
};