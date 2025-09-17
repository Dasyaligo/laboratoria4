
const API_URL = 'http://localhost:3001/api/users';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

export async function getProfile() {
    const response = await fetch(`${API_URL}/profile`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении профиля');
    }

    return await response.json();
}

export async function updateProfile(profileData) {
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            full_name: profileData.full_name,
            email: profileData.email,
            phone: profileData.phone,
            default_address: profileData.default_address
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении профиля');
    }

    return await response.json();
}

export async function changePassword(passwordData) {
    const response = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при изменении пароля');
    }

    return await response.json();
}

export async function getAppointments() {
    const response = await fetch(`${API_URL}/appointments`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении записей');
    }

    return await response.json();
}

export async function getAppointmentById(appointment_id) {
    const response = await fetch(`${API_URL}/appointments/${appointment_id}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении записи');
    }

    return await response.json();
}

export async function createAppointment(appointmentData) {
    const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            flight_id: appointmentData.flight_id,
            order_id: appointmentData.order_id,
            passengers_count: appointmentData.passengers_count,
            seat_numbers: appointmentData.seat_numbers,
            boarding_time: appointmentData.boarding_time,
            special_requests: appointmentData.special_requests
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании записи');
    }

    return await response.json();
}

export async function updateAppointment(appointment_id, appointmentData) {
    const response = await fetch(`${API_URL}/appointments/${appointment_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            passengers_count: appointmentData.passengers_count,
            seat_numbers: appointmentData.seat_numbers,
            boarding_time: appointmentData.boarding_time,
            status: appointmentData.status,
            special_requests: appointmentData.special_requests
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении записи');
    }

    return await response.json();
}

export async function cancelAppointment(appointment_id) {
    const response = await fetch(`${API_URL}/appointments/${appointment_id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при отмене записи');
    }

    return await response.json();
}
