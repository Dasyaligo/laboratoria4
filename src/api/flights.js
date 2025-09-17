const API_URL = 'http://localhost:3001/api/flights';

export async function getFlights(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });

    const response = await fetch(`${API_URL}?${queryParams}`);
    
    if (!response.ok) {
        throw new Error('Ошибка при получении рейсов');
    }

    return await response.json();
}

export async function getFlightById(flightId) {
    const response = await fetch(`${API_URL}/${flightId}`);
    
    if (!response.ok) {
        throw new Error('Ошибка при получении информации о рейсе');
    }

    return await response.json();
}

export async function searchFlights(origin, destination, date) {
    const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin, destination, date }),
    });

    if (!response.ok) {
        throw new Error('Ошибка поиска рейсов');
    }

    return await response.json();
}

export async function createFlight(flightData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
    });
    
    if (!response.ok) {
        throw new Error('Ошибка при создании рейса');
    }

    return await response.json();
}

export async function updateFlight(flightId, flightData) {
    const response = await fetch(`${API_URL}/${flightId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
    });
    
    if (!response.ok) {
        throw new Error('Ошибка при обновлении рейса');
    }

    return await response.json();
}

export async function deleteFlight(flightId) {
    const response = await fetch(`${API_URL}/${flightId}`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        throw new Error('Ошибка при удалении рейса');
    }

    return await response.json();
}