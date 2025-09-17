const API_URL = 'http://localhost:3001/api/cart';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export async function getCart() {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении корзины');
    }

    return await response.json();
}

export async function addToCart(flightId, passengersCount = 1) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ flight_id: flightId, passengers_count: passengersCount })
    });

    if (!response.ok) {
        throw new Error('Ошибка при добавлении в корзину');
    }

    return await response.json();
}

export async function updateCartItem(cartId, passengersCount) {
    const response = await fetch(`${API_URL}/${cartId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ passengers_count: passengersCount })
    });

    if (!response.ok) {
        throw new Error('Ошибка при обновлении корзины');
    }

    return await response.json();
}

export async function removeFromCart(cartId) {
    const response = await fetch(`${API_URL}/${cartId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении из корзины');
    }

    return await response.json();
}

export async function clearCart() {
    const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при очистке корзины');
    }

    return await response.json();
}