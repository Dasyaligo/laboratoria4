import { useState, useEffect } from 'react';

const Orders = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Ошибка загрузки заказов');
            
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (!user) {
        return (
            <div className="orders">
                <h2>Мои заказы</h2>
                <p>Для просмотра заказов необходимо войти в систему</p>
            </div>
        );
    }

    if (loading) return <div>Загрузка заказов...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="orders">
            <h2>Мои заказы</h2>
            
            {orders.length === 0 ? (
                <p>У вас пока нет заказов</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.order_id} className="order-card">
                            <h3>Заказ #{order.order_id}</h3>
                            <p><strong>Статус:</strong> {order.status}</p>
                            <p><strong>Сумма:</strong> {order.total_amount} руб.</p>
                            <p><strong>Адрес доставки:</strong> {order.delivery_address}</p>
                            <p><strong>Дата доставки:</strong> {formatDate(order.delivery_date)}</p>
                            <p><strong>Дата создания:</strong> {formatDate(order.created_at)}</p>
                            
                            <div className="order-appointments">
                                <h4>Рейсы:</h4>
                                {order.appointments && order.appointments.map(app => (
                                    <div key={app.flight_id} className="appointment">
                                        <span>Рейс #{app.flight_id} - {app.passengers_count} пассажир(ов)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;