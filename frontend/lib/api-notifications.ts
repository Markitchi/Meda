/**
 * API client for notifications
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export const notificationsApi = {
    /**
     * Get notifications for current user
     */
    async getNotifications(token: string, unreadOnly: boolean = false): Promise<Notification[]> {
        const url = `${API_BASE_URL}/notifications?unread_only=${unreadOnly}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return response.json();
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(token: string): Promise<number> {
        const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch unread count');
        }

        const data = await response.json();
        return data.count;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(token: string, notificationId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(token: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark all as read');
        }
    },

    /**
     * Delete notification
     */
    async deleteNotification(token: string, notificationId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete notification');
        }
    },
};
