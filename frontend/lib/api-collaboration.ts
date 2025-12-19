import { apiRequest } from './api';

export interface ConsultationShare {
    id: number;
    consultation_id: number;
    shared_by_id: number;
    shared_with_id: number;
    permission: 'READ' | 'WRITE';
    created_at: string;
    shared_by?: {
        id: number;
        email: string;
        full_name: string;
    };
    shared_with?: {
        id: number;
        email: string;
        full_name: string;
    };
}

export interface Comment {
    id: number;
    consultation_id: number;
    user_id: number;
    content: string;
    mentions: number[];
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        email: string;
        full_name: string;
    };
}

export interface AuditLog {
    id: number;
    entity_type: string;
    entity_id: number;
    action: string;
    user_id: number;
    changes: Record<string, any>;
    created_at: string;
    user?: {
        id: number;
        email: string;
        full_name: string;
    };
}

export interface ShareConsultationRequest {
    shared_with_id: number;
    permission: 'READ' | 'WRITE';
}

export interface AddCommentRequest {
    content: string;
    mentions?: number[];
}

export const collaborationApi = {
    // Share a consultation
    shareConsultation: async (consultationId: number, data: ShareConsultationRequest): Promise<ConsultationShare> => {
        return apiRequest(`/collaboration/consultations/${consultationId}/share`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get shares for a consultation
    getConsultationShares: async (consultationId: number): Promise<ConsultationShare[]> => {
        return apiRequest(`/collaboration/consultations/${consultationId}/shares`);
    },

    // Revoke a share
    revokeShare: async (consultationId: number, shareId: number): Promise<{ message: string }> => {
        return apiRequest(`/collaboration/consultations/${consultationId}/shares/${shareId}`, {
            method: 'DELETE',
        });
    },

    // Get consultations shared with current user
    getSharedConsultations: async (): Promise<ConsultationShare[]> => {
        return apiRequest('/collaboration/shared-with-me');
    },

    // Add a comment
    addComment: async (consultationId: number, data: AddCommentRequest): Promise<Comment> => {
        return apiRequest(`/collaboration/consultations/${consultationId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get comments for a consultation
    getComments: async (consultationId: number): Promise<Comment[]> => {
        return apiRequest(`/collaboration/consultations/${consultationId}/comments`);
    },

    // Delete a comment
    deleteComment: async (consultationId: number, commentId: number): Promise<{ message: string }> => {
        return apiRequest(`/collaboration/consultations/${consultationId}/comments/${commentId}`, {
            method: 'DELETE',
        });
    },

    // Get audit logs for a consultation
    getAuditLogs: async (entityType: string, entityId: number): Promise<AuditLog[]> => {
        return apiRequest(`/collaboration/audit-logs/${entityType}/${entityId}`);
    },
};
