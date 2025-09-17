import { useEffect, useState } from 'react';

const AppointmentsList = ({ user }) => {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

const loadAppointments = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Требуется авторизация');
            return;
        }

        const response = await fetch('http://localhost:3001/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке записей');
        }

        const orders = await response.json();
        
        // Извлекаем все appointments из заказов
        const allAppointments = [];
        orders.forEach(order => {
            if (order.appointments && Array.isArray(order.appointments)) {
                order.appointments.forEach(appointment => {
                    if (appointment && appointment.appointment_id) {
                        allAppointments.push({
                            ...appointment,
                            order_id: order.order_id,
                            order_status: order.status,
                            delivery_address: order.delivery_address,
                            total_amount: order.total_amount
                        });
                    }
                });
            }
        });

        setAppointments(allAppointments);
        setError(null);
    } catch (err) {
        setError(err.message);
        console.error('Ошибка при загрузке записей:', err);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        if (user) {
            loadAppointments();
        }
    }, [user]);

    const handleRefresh = () => {
        loadAppointments();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#d4edda';
            case 'cancelled': return '#f8d7da';
            case 'delivered': return '#d1ecf1';
            case 'checked_in': return '#fff3cd';
            case 'boarded': return '#cce5ff';
            default: return '#f8f9fa';
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидание',
            'confirmed': 'Подтвержден',
            'cancelled': 'Отменен',
            'delivered': 'Доставлен',
            'booked': 'Забронирован',
            'checked_in': 'Зарегистрирован',
            'boarded': 'На борту',
            'completed': 'Завершен'
        };
        return statusMap[status] || status;
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2>Мои записи на рейсы</h2>
                <p>Для просмотра записей необходимо войти в систему</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Загрузка записей...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ color: 'red', padding: '20px' }}>
                <div>Ошибка: {error}</div>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2>Мои записи на рейсы</h2>
                <div>Записей на рейсы не найдено</div>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Обновить
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Мои записи на рейсы ({appointments.length})</h2>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Обновить
                </button>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                {appointments.map(appointment => (
                    <div key={appointment.appointment_id} style={{ 
                        border: '1px solid #dee2e6', 
                        padding: '20px', 
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                                    Рейс #{appointment.flight_id}
                                </h3>
                                {appointment.flight_info && (
                                    <p style={{ margin: '0', color: '#6c757d' }}>
                                        {appointment.flight_info.origin} → {appointment.flight_info.destination}
                                        <br />
                                        <small>{appointment.flight_info.airline}</small>
                                    </p>
                                )}
                            </div>
                            <div style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                backgroundColor: getStatusColor(appointment.status),
                                color: '#000',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                                {getStatusText(appointment.status)}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                                <strong style={{ color: '#495057' }}>ID записи:</strong> 
                                <span style={{ marginLeft: '8px', color: '#007bff' }}>{appointment.appointment_id}</span>
                            </div>
                            <div>
                                <strong style={{ color: '#495057' }}>ID заказа:</strong> 
                                <span style={{ marginLeft: '8px', color: '#007bff' }}>{appointment.order_id}</span>
                            </div>
                            <div>
                                <strong style={{ color: '#495057' }}>Пассажиров:</strong> 
                                <span style={{ marginLeft: '8px', color: "black" }}>{appointment.passengers_count}</span>
                            </div>
                            <div>
                                <strong style={{ color: '#495057' }}>Статус заказа:</strong> 
                                <span style={{ marginLeft: '8px', color: "black" }}>{getStatusText(appointment.order_status)}</span>
                            </div>
                        </div>

                        {appointment.flight_info && appointment.flight_info.departure_date && (
                            <div style={{ marginTop: '10px' }}>
                                <strong style={{ color: '#495057' }}>Дата вылета:</strong> 
                                <span style={{ marginLeft: '8px', color: "black" }}>
                                    {formatDate(appointment.flight_info.departure_date)}
                                </span>
                            </div>
                        )}

                        {appointment.delivery_address && (
                            <div style={{ marginTop: '10px' }}>
                                <strong style={{ color: '#495057' }}>Адрес доставки:</strong> 
                                <span style={{ marginLeft: '8px', color: "black" }}>{appointment.delivery_address}</span>
                            </div>
                        )}

                        {appointment.total_amount && (
                            <div style={{ marginTop: '10px' }}>
                                <strong style={{ color: '#495057' }}>Сумма заказа:</strong> 
                                <span style={{ marginLeft: '8px', color: "black" }}>{appointment.total_amount} руб.</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppointmentsList;