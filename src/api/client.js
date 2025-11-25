import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 150000,
    withCredentials: true, // Wichtig für HttpOnly Cookies
    headers: {
        // HINWEIS: 'Content-Type': 'application/json' WURDE ENTFERNT.
        // Axios setzt den Content-Type nun automatisch, basierend auf dem Body.
        // Für JSON-Objekte wird es 'application/json', für FormData wird es 'multipart/form-data'.
        'Accept': 'application/json',
    },
});

// Response Interceptor für Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Bei 401 Unauthorized zur Login-Seite weiterleiten
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Skip redirect für Login/Register Endpunkte
            const skipRedirectFor = ['/api/login', '/api/register', '/api/password/'];
            const shouldSkipRedirect = skipRedirectFor.some(path => 
                originalRequest.url?.includes(path)
            );

            if (!shouldSkipRedirect && typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Helper-Funktion für Fehlermeldungen
export const getErrorMessage = (error) => {
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.violations) return error.response.data.violations.join(', ');
    if (error.message) return error.message;
    return 'Ein unerwarteter Fehler ist aufgetreten';
};

export default apiClient;