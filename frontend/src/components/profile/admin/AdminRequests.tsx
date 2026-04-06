import { useState, useEffect } from 'react';
import { AdminRequestCard } from './AdminRequestCard';
import { ConfirmModal } from '../../ConfirmModal';
import { toast } from 'react-hot-toast';

export const AdminRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/register/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: number, creds: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/register/approve/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(creds)
      });
      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success('Заявка обработана');
      }
    } catch (err) {
      toast.error('Ошибка сервера');
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/register/reject/${selectedId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== selectedId));
        toast.success('Заявка отклонена');
      }
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  if (loading) return <div className="text-center py-20 font-roboto">Загрузка...</div>;

  return (
    <div className="space-y-12 pb-20 max-w-[1000px] mx-auto">
      {requests.map((req) => (
        <AdminRequestCard 
          key={req.id}
          hasProfile={req.has_profile} 
          userData={{
            id: req.id,
            lastName: req.familia,
            firstName: req.name,
            middleName: req.otchestvo,
            birthDate: new Date(req.birth_date).toLocaleDateString(),
            phone: req.phone,
            email: req.email,
            city: req.city,
            organization: req.organization,
            role_id: req.role_id
          }}
          onApprove={(creds) => handleApprove(req.id, creds)}
          onReject={() => {
            setSelectedId(req.id);
            setIsConfirmOpen(true);
          }}
        />
      ))}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleReject}
        title={`Вы уверены, что хотите\nотклонить эту заявку?`}
      />
    </div>
  );
};