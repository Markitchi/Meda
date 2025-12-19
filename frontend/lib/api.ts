export const api = {
    // Auth
    async register(data: { email: string; password: string; full_name: string; role: string }) {
        const response = await fetch('http://localhost:8000/api/v1/auth/register', {
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
        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
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
        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to get user');
        return response.json();
    },

    // Patients
    async getPatients(token: string, search?: string) {
        const url = new URL('http://localhost:8000/api/v1/patients/');
        if (search) url.searchParams.set('search', search);

        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
    },

    async getPatient(token: string, id: number) {
        const response = await fetch(`http://localhost:8000/api/v1/patients/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch patient');
        return response.json();
    },

    async createPatient(token: string, data: any) {
        const response = await fetch('http://localhost:8000/api/v1/patients/', {
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
        const response = await fetch(`http://localhost:8000/api/v1/patients/${id}`, {
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
        const response = await fetch(`http://localhost:8000/api/v1/patients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to delete patient');
    },

    async getPatientImages(token: string, patientId: number) {
        const response = await fetch(`http://localhost:8000/api/v1/patients/${patientId}/images`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch patient images');
        return response.json();
    },

    // Users list for collaboration
    async get(endpoint: string) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/v1${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Request failed');
        return response.json();
    },
};

// Generic API request helper for collaboration module
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:8000/api/v1${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
}

