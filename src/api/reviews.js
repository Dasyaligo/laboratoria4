const API_URL = 'http://localhost:3001/api/reviews';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

export async function getReviewsByFlight(flight_id) {
    const response = await fetch(`${API_URL}/flight/${flight_id}`);

    if (!response.ok) {
        throw new Error('Ошибка при получении отзывов рейса');
    }

    return await response.json();
}

export async function getUserReviews() {
    const response = await fetch(`${API_URL}/user`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении отзывов пользователя');
    }

    return await response.json();
}

export async function getReviewById(review_id) {
    const response = await fetch(`${API_URL}/${review_id}`);

    if (!response.ok) {
        throw new Error('Ошибка при получении отзыва');
    }

    return await response.json();
}

export async function createReview(created_at) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(created_at)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании отзыва');
    }

    return await response.json();
}

export async function updateReview(review_id, created_at) {
    const response = await fetch(`${API_URL}/${review_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(created_at)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении отзыва');
    }

    return await response.json();
}

export async function deleteReview(review_id) {
    const response = await fetch(`${API_URL}/${review_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при удалении отзыва');
    }

    return await response.json();
}