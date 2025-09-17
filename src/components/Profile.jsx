import { useState, useEffect } from 'react';

const Profile = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        default_address: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                default_address: user.default_address || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:3001/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Ошибка обновления профиля');
            
            const updatedUser = await response.json();
            onUpdate(updatedUser);
            setMessage('Профиль успешно обновлен');
        } catch (error) {
            setMessage('Ошибка обновления профиля');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile">
            <h2>Личный кабинет</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="ФИО"
                />
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Email"
                />
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Телефон"
                />
                <input
                    type="text"
                    value={formData.default_address}
                    onChange={(e) => setFormData({...formData, default_address: e.target.value})}
                    placeholder="Адрес по умолчанию"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Profile;