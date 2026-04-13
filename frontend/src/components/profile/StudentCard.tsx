import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface StudentCardProps {
    id: number;
    fullName: string;
    email: string;
    phone: string;
}

export const StudentCard = ({ id, fullName, email, phone }: StudentCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/profile?viewAs=teacher&studentId=${id}`);
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            onClick={handleClick}
            className="bg-brand-light-teal border border-brand-accent-teal rounded-[30px] p-6 md:p-8 shadow-[0_4px_0_0_#337D86] cursor-pointer transition-all hover:shadow-[0_6px_0_0_#337D86]"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <h3 className="font-unbounded text-brand-dark-teal text-xl md:text-2xl font-normal">
                        {fullName}
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                        {email && (
                            <p className="font-roboto text-brand-dark-teal opacity-70 text-sm">
                                 {email}
                            </p>
                        )}
                        {phone && (
                            <p className="font-roboto text-brand-dark-teal opacity-70 text-sm">
                                 {phone}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-brand-accent-teal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </motion.div>
    );
};