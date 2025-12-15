const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = {
    // Auth
    async register(data: { email: string; password: string; full_name: string; role: string }) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        return response.json();
    },

    async login(email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        return response.json();
    },

    async getCurrentUser(token: string) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to get user');
        return response.json();
    },

    // Patients
    async getPatients(token: string, search?: string) {
        const url = new URL(`${API_BASE_URL}/patients/`);
        if (search) url.searchParams.set('search', search);

        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
    },

    async getPatient(token: string, id: number) {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch patient');
        return response.json();
    },

    async createPatient(token: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/patients/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create patient');
        }
        return response.json();
    },

    async updatePatient(token: string, id: number, data: any) {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update patient');
        return response.json();
    },

    async deletePatient(token: string, id: number) {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to delete patient');
    },

    async getPatientImages(token: string, patientId: number) {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/images`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch patient images');
        return response.json();
    },
};
