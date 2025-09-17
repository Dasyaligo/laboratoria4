import { useState } from 'react';

const LoginForm = ({ onLogin, loading, setLoading }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('');

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат email';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка авторизации');
            }

            const data = await response.json();
            onLogin(data.user, data.token);
            
        } catch (err) {
            setLoginError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <section className="login-form">
            <h2>Авторизация</h2>
            
            {loginError && (
                <div className="error-message">
                    {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="login-form-container">
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="submit-btn"
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>

            <div className="demo-credentials">
                <h4>Тестовые данные:</h4>
                <p>Email: test@example.com</p>
                <p>Пароль: password123</p>
            </div>
        </section>
    );
};

export default LoginForm;