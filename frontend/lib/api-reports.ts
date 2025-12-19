/**
 * API client for PDF reports
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const reportsApi = {
    /**
     * Download consultation PDF report
     */
    async downloadConsultationPDF(token: string, consultationId: number) {
        const response = await fetch(`${API_BASE_URL}/reports/consultation/${consultationId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download consultation report');
        }

        // Get filename from headers
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `Rapport_Consultation_${consultationId}.pdf`;

        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    /**
     * Download patient history PDF report
     */
    async downloadPatientPDF(token: string, patientId: number) {
        const response = await fetch(`${API_BASE_URL}/reports/patient/${patientId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download patient report');
        }

        // Get filename from headers
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `Dossier_Patient_${patientId}.pdf`;

        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
