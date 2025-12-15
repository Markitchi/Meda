// Extend API client with analysis functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = {
    // ... existing functions ...

    // Analysis endpoints
    async startAnalysis(token: string, imageId: number) {
        const response = await fetch(`${API_BASE_URL}/analysis/start/${imageId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Échec du démarrage de l\'analyse');
        }
        return response.json();
    },

    async getAnalysis(token: string, analysisId: number) {
        const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Échec de la récupération de l\'analyse');
        }
        return response.json();
    },

    async getImageAnalyses(token: string, imageId: number) {
        const response = await fetch(`${API_BASE_URL}/analysis/image/${imageId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Échec de la récupération des analyses');
        }
        return response.json();
    },

    async deleteAnalysis(token: string, analysisId: number) {
        const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Échec de la suppression de l\'analyse');
        }
        return response.json();
    },
};
