import { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import FlightsCatalog from './components/FlightsCatalog';
import ShoppingCart from './components/ShoppingCart';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import Profile from './components/Profile';
import Orders from './components/Orders';
import Reviews from './components/Reviews';
import AppointmentsList from './components/AppointmentsList';
import './App.css';

function AppContent() {
    const [currentView, setCurrentView] = useState('catalog');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { 
        items: cart, 
        totalAmount, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
    } = useCart();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                try {
                    const response = await fetch('http://localhost:3001/api/auth/verify', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.valid) {
                            setUser(JSON.parse(savedUser));
                        } else {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                        }
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    console.error('Token verification error:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        };

        checkAuth();
    }, []);

    const handleLogin = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setCurrentView('catalog');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearCart();
        setCurrentView('catalog');
    };

    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const renderContent = () => {
        switch (currentView) {
            case 'catalog':
                return <FlightsCatalog addToCart={addToCart} loading={loading} setLoading={setLoading} />;
            case 'cart':
                return <ShoppingCart 
                    cart={cart} 
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    clearCart={clearCart}
                    totalAmount={totalAmount}
                    user={user}
                    setCurrentView={setCurrentView}
                />;
            case 'login':
                return <LoginForm onLogin={handleLogin} loading={loading} setLoading={setLoading} />;
            case 'register':
                return <RegistrationForm onRegister={handleLogin} loading={loading} setLoading={setLoading} />;
            case 'profile':
                return <Profile user={user} onUpdate={handleProfileUpdate} />;
            case 'orders':
                return <Orders user={user} />;
            case 'reviews':
                return <Reviews user={user} />;
            case 'appointments':
                return <AppointmentsList user={user} />;
            default:
                return <FlightsCatalog addToCart={addToCart} loading={loading} setLoading={setLoading} />;
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>✈️ Авиабилеты Online</h1>
                <nav className="app-nav">
                    <button 
                        onClick={() => setCurrentView('catalog')}
                        className={currentView === 'catalog' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Поиск рейсов
                    </button>
                    <button 
                        onClick={() => setCurrentView('cart')}
                        className={currentView === 'cart' ? 'nav-btn active' : 'nav-btn'}
                    >
                        🛒 Корзина ({cart.length})
                    </button>
                    
                    {user ? (
                        <div className="user-menu">
                            <span className="user-welcome">👋 Добро пожаловать, {user.full_name}</span>
                            <button 
                                onClick={() => setCurrentView('appointments')}
                                className={currentView === 'appointments' ? 'nav-btn active' : 'nav-btn'}
                            >
                                Мои записи
                            </button>
                            <button 
                                onClick={() => setCurrentView('orders')}
                                className={currentView === 'orders' ? 'nav-btn active' : 'nav-btn'}
                            >
                                Мои заказы
                            </button>
                            <button 
                                onClick={() => setCurrentView('reviews')}
                                className={currentView === 'reviews' ? 'nav-btn active' : 'nav-btn'}
                            >
                                Отзывы
                            </button>
                            <button 
                                onClick={() => setCurrentView('profile')}
                                className={currentView === 'profile' ? 'nav-btn active' : 'nav-btn'}
                            >
                                Профиль
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="nav-btn logout-btn"
                            >
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <button 
                                onClick={() => setCurrentView('login')}
                                className={currentView === 'login' ? 'nav-btn active' : 'nav-btn'}
                            >
                                Войти
                            </button>
                            <button 
                                onClick={() => setCurrentView('register')}
                                className={currentView === 'register' ? 'nav-btn active' : 'nav-btn'}
                            >
                                Регистрация
                            </button>
                        </div>
                    )}
                </nav>
            </header>

            <main className="app-main">
                {renderContent()}
            </main>

            <footer className="app-footer">
                <p>© 2024 Авиабилеты Online. Все права защищены.</p>
            </footer>
        </div>
    );
}

function App() {
    return (
        <CartProvider>
            <AppContent />
        </CartProvider>
    );
}

export default App;