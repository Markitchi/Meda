// Token refresh utility
export const tokenManager = {
    // Check if token is expired or about to expire
    isTokenExpiringSoon(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const timeUntilExpiry = exp - now;

            // Return true if token expires in less than 5 minutes
            return timeUntilExpiry < 5 * 60 * 1000;
        } catch (error) {
            return true; // If we can't parse, assume it's expired
        }
    },

    // Refresh the access token using refresh token
    async refreshAccessToken(): Promise<string | null> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                return null;
            }

            const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                return data.access_token;
            }

            return null;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }
    },

    // Get valid token (refresh if needed)
    async getValidToken(): Promise<string | null> {
        let token = localStorage.getItem('access_token');

        if (!token) {
            return null;
        }

        // Check if token is expiring soon
        if (this.isTokenExpiringSoon(token)) {
            console.log('🔄 Token expiring soon, refreshing...');
            const newToken = await this.refreshAccessToken();
            if (newToken) {
                console.log('✅ Token refreshed successfully');
                return newToken;
            } else {
                console.log('❌ Token refresh failed');
                // Clear invalid tokens
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return null;
            }
        }

        return token;
    },

    // Setup automatic token refresh interval
    startAutoRefresh() {
        // Check every 4 minutes
        setInterval(async () => {
            const token = localStorage.getItem('access_token');
            if (token && this.isTokenExpiringSoon(token)) {
                await this.refreshAccessToken();
            }
        }, 4 * 60 * 1000);
    },
};
