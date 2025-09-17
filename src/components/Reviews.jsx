import { useState, useEffect } from 'react';

const Reviews = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadFlights = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/flights');
            const data = await response.json();
            setFlights(data);
        } catch (error) {
            console.error('Ошибка загрузки рейсов:', error);
        }
    };

    const loadReviews = async (flightId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/reviews/${flightId}`);
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user || !selectedFlight) return;

        try {
            const response = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    flight_id: selectedFlight,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (response.ok) {
                setNewReview({ rating: 5, comment: '' });
                loadReviews(selectedFlight);
            }
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
        }
    };

    useEffect(() => {
        loadFlights();
    }, []);

    return (
        <div className="reviews">
            <h2>Отзывы</h2>
            
            <div className="flight-selector">
                <select 
                    value={selectedFlight || ''} 
                    onChange={(e) => {
                        setSelectedFlight(e.target.value);
                        loadReviews(e.target.value);
                    }}
                >
                    <option value="">Выберите рейс</option>
                    {flights.map(flight => (
                        <option key={flight.flight_id} value={flight.flight_id}>
                            {flight.origin} → {flight.destination} ({flight.airline})
                        </option>
                    ))}
                </select>
            </div>

            {selectedFlight && user && (
                <form onSubmit={handleSubmitReview} className="review-form">
                    <h3>Оставить отзыв</h3>
                    <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    >
                        <option value={5}>5 звезд</option>
                        <option value={4}>4 звезды</option>
                        <option value={3}>3 звезды</option>
                        <option value={2}>2 звезды</option>
                        <option value={1}>1 звезда</option>
                    </select>
                    <textarea
                        placeholder="Ваш отзыв"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        required
                    />
                    <button type="submit">Отправить отзыв</button>
                </form>
            )}

            <div className="reviews-list">
                {loading ? (
                    <p>Загрузка отзывов...</p>
                ) : reviews.length === 0 ? (
                    <p>Пока нет отзывов для этого рейса</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.review_id} className="review-card">
                            <h4>{review.full_name}</h4>
                            <div className="rating">{"⭐".repeat(review.rating)}</div>
                            <p>{review.comment}</p>
                            <small>{new Date(review.created_at).toLocaleDateString('ru-RU')}</small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;