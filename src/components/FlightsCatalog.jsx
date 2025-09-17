import { useState, useEffect } from 'react';

const FlightsCatalog = ({ addToCart, loading, setLoading }) => {
    const [flights, setFlights] = useState([]);
    const [filters, setFilters] = useState({
        origin: '',
        destination: '',
        minPrice: '',
        maxPrice: '',
        airline: ''
    });

    const loadFlights = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`http://localhost:3001/api/flights?${queryParams}`);
            if (!response.ok) throw new Error('Ошибка загрузки рейсов');
            
            const data = await response.json();
            setFlights(data);
        } catch (err) {
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFlights();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        loadFlights();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    return (
        <section className="flights-catalog">
            <h2>Поиск авиарейсов</h2>
            
            <div className="filters">
                <input
                    type="text"
                    placeholder="Откуда"
                    value={filters.origin}
                    onChange={(e) => handleFilterChange('origin', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Куда"
                    value={filters.destination}
                    onChange={(e) => handleFilterChange('destination', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Мин. цена"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Макс. цена"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Авиакомпания"
                    value={filters.airline}
                    onChange={(e) => handleFilterChange('airline', e.target.value)}
                />
                <button onClick={handleSearch}>Поиск</button>
            </div>

            <div className="flights-grid">
                {flights.map(flight => (
                    <div key={flight.flight_id} className="flight-card">
                        <div className="flight-info">
                            <h3>{flight.origin} → {flight.destination}</h3>
                            <p className="airline">{flight.airline}</p>
                            <div className="flight-details">
                                <span>Вылет: {formatDate(flight.departure_date)}</span>
                                <span>Прилет: {formatDate(flight.arrival_date)}</span>
                                <span>Длительность: {flight.duration.hours}ч {flight.duration.minutes}мин</span>
                                <span>Свободных мест: {flight.available_seats}</span>
                            </div>
                            <div className="price">{flight.price} руб.</div>
                        </div>
                        <button
                            onClick={() => addToCart(flight)}
                            className="add-to-cart-btn"
                            disabled={flight.available_seats === 0}
                        >
                            {flight.available_seats > 0 ? 'Добавить в корзину' : 'Мест нет'}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FlightsCatalog;