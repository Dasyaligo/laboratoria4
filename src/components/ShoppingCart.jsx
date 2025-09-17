import { useState } from 'react';

const ShoppingCart = ({ 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalAmount, 
    user,
    setCurrentView 
}) => {
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [deliveryData, setDeliveryData] = useState({
        delivery_address: '',
        delivery_date: ''
    });

    const handleCheckout = async () => {
        try {
            setCheckoutLoading(true);
            setCheckoutError('');

            const orderData = {
                cart_items: cart,
                total_amount: totalAmount,
                delivery_address: deliveryData.delivery_address || user?.default_address,
                delivery_date: deliveryData.delivery_date
            };

            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка оформления заказа');
            }

            const result = await response.json();
            alert('Заказ успешно оформлен! Номер заказа: ' + result.order_id);
            clearCart();
            setCurrentView('orders');
            
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            setCheckoutError(error.message);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const validateDeliveryDate = (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        return selectedDate >= today;
    };

    if (cart.length === 0) {
        return (
            <section className="shopping-cart">
                <h2>Корзина</h2>
                <div className="empty-cart">
                    <p>Ваша корзина пуста</p>
                    <button 
                        onClick={() => setCurrentView('catalog')}
                        className="browse-btn"
                    >
                        Найти рейсы
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="shopping-cart">
            <div className="cart-header">
                <h2>Корзина</h2>
                <button onClick={clearCart} className="clear-cart-btn">
                    Очистить корзину
                </button>
            </div>

            {checkoutError && (
                <div className="error-message">
                    {checkoutError}
                </div>
            )}

            <div className="cart-items">
                {cart.map(item => (
                    <div key={item.flight_id} className="cart-item">
                        <div className="item-info">
                            <h4>{item.origin} → {item.destination}</h4>
                            <p className="item-airline">{item.airline}</p>
                            <span className="item-price">{item.price} руб. за пассажира</span>
                        </div>
                        
                        <div className="item-controls">
                            <div className="quantity-controls">
                                <button
                                    onClick={() => updateQuantity(item.flight_id, item.quantity - 1)}
                                    className="quantity-btn"
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="quantity">{item.quantity} пассажир(ов)</span>
                                <button
                                    onClick={() => updateQuantity(item.flight_id, item.quantity + 1)}
                                    className="quantity-btn"
                                >
                                    +
                                </button>
                            </div>
                            
                            <div className="item-total">
                                {item.price * item.quantity} руб.
                            </div>
                            
                            <button
                                onClick={() => removeFromCart(item.flight_id)}
                                className="remove-btn"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div className="total-amount">
                    <strong>Итого: {totalAmount} руб.</strong>
                </div>

                <div className="delivery-form">
                    <h3>Данные для оформления</h3>
                    <input
                        type="text"
                        placeholder="Адрес доставки"
                        value={deliveryData.delivery_address}
                        onChange={(e) => setDeliveryData({...deliveryData, delivery_address: e.target.value})}
                    />
                    <input
                        type="date"
                        placeholder="Дата доставки"
                        value={deliveryData.delivery_date}
                        onChange={(e) => setDeliveryData({...deliveryData, delivery_date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                
                {!user ? (
                    <div className="auth-required">
                        <p>Для оформления заказа необходимо войти в систему</p>
                        <button 
                            onClick={() => setCurrentView('login')}
                            className="login-btn"
                        >
                            Войти
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleCheckout} 
                        className="checkout-btn"
                        disabled={checkoutLoading || !deliveryData.delivery_date || !validateDeliveryDate(deliveryData.delivery_date)}
                    >
                        {checkoutLoading ? 'Оформление...' : 'Оформить заказ'}
                    </button>
                )}
            </div>
        </section>
    );
};

export default ShoppingCart;