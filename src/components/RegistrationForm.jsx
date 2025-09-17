import { useState } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

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
        
        if (!formData.full_name?.trim()) newErrors.full_name = 'ФИО обязательно';
        if (!formData.email?.trim()) newErrors.email = 'Email обязателен';
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
            setErrors({});
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    full_name: formData.full_name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    phone: formData.phone || null,
                    default_address: formData.default_address || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Ошибка регистрации');
            }

            const data = await response.json();
            
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onRegister(data.user, data.token);
            }
            
        } catch (err) {
            console.error('Registration error:', err);
            setErrors({ submit: err.message || 'Ошибка соединения с сервером' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-form">
            <h2>Регистрация</h2>
            
            {errors.submit && (
                <div className="error-message">
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="registration-form-container">
                <div className="form-group">
                    <label htmlFor="full_name">ФИО:*</label>
                    <input
                        type="text"
                        id="full_name"
                        placeholder="Иван Иванов"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className={errors.full_name ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:*</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={errors.email ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль:*</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Минимум 6 символов"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={errors.password ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Подтвердите пароль:*</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Повторите пароль"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={errors.confirmPassword ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Телефон:</label>
                    <input
                        type="tel"
                        id="phone"
                        placeholder="+7 (999) 999-99-99"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="default_address">Адрес:</label>
                    <input
                        type="text"
                        id="default_address"
                        placeholder="ул. Пушкина, д. 10, кв. 5"
                        value={formData.default_address}
                        onChange={(e) => setFormData({...formData, default_address: e.target.value})}
                        disabled={loading}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="submit-btn"
                >
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>

            <div className="demo-credentials">
                <h4>Пример данных для регистрации:</h4>
                <p>ФИО: Иван Иванов</p>
                <p>Email: test@example.com</p>
                <p>Пароль: password123</p>
            </div>
        </div>
    );
};

export default RegistrationForm;