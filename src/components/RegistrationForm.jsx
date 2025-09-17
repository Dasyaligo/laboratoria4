import { useState } from 'react';

const RegistrationForm = ({ onRegister, loading, setLoading }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        default_address: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.full_name) newErrors.full_name = 'ФИО обязательно';
        if (!formData.email) newErrors.email = 'Email обязателен';
        if (!formData.password) newErrors.password = 'Пароль обязателен';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }
        if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка регистрации');
            }

            const data = await response.json();
            onRegister(data.user);
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Регистрация</h2>
            
            <input
                type="text"
                placeholder="ФИО"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
            {errors.full_name && <span>{errors.full_name}</span>}

            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {errors.email && <span>{errors.email}</span>}

            <input
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            {errors.password && <span>{errors.password}</span>}

            <input
                type="password"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
            {errors.confirmPassword && <span>{errors.confirmPassword}</span>}

            <input
                type="tel"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <input
                type="text"
                placeholder="Адрес по умолчанию"
                value={formData.default_address}
                onChange={(e) => setFormData({...formData, default_address: e.target.value})}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            {errors.submit && <span>{errors.submit}</span>}
        </form>
    );
};

export default RegistrationForm;