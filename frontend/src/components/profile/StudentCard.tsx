import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface StudentCardProps {
  id: number;
  fio: string;
  email: string;
  phone: string;
}

export const StudentCard = ({ id, fio, email, phone }: StudentCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/profile?role=student&viewAs=teacher`)}
      className="bg-brand-light-teal border border-brand-accent-teal rounded-[40px] p-10 cursor-pointer transition-all shadow-[0_6px_0_0_#337D86]"
    >
      <div className="flex flex-col">
        <h3 className="font-unbounded text-2xl text-brand-dark-teal mb-6 leading-tight font-normal">
          {fio}
        </h3>
        
        <div className="space-y-2 font-unbounded text-sm text-brand-dark-teal font-normal opacity-70">
          <p>Почта: {email}</p>
          <p>Телефон: {phone}</p>
        </div>
      </div>
    </motion.div>
  );
};