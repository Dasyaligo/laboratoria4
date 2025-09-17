const API_URL = 'http://localhost:3001/api/orders';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export async function getOrders() {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении заказов');
    }

    return await response.json();
}

export async function getOrderById(orderId) {
    const response = await fetch(`${API_URL}/${orderId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении заказа');
    }

    return await response.json();
}

export async function createOrder(orderData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании заказа');
    }

    return await response.json();
}

export async function updateOrder(orderId, orderData) {
    const response = await fetch(`${API_URL}/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        throw new Error('Ошибка при обновлении заказа');
    }

    return await response.json();
}

export async function cancelOrder(orderId) {
    const response = await fetch(`${API_URL}/${orderId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при отмене заказа');
    }

    return await response.json();
}