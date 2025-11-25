import axios from 'axios';
import apiClient from './client';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000';

export const pollAgentStatus = async (sessionId) => {
    // Fügen Sie hier die tatsächliche Logik für die Statusabfrage ein
    const response = await apiClient.get(`/api/agent/status/${sessionId}`);
    return response.data;
};

export const callPersonalAssistant = async (prompt, context) => {
    // Fügen Sie hier die tatsächliche Logik für den Assistenten-Aufruf ein
    const response = await apiClient.post('/api/agent/personal', { prompt, context });
    return response.data;
};

export const callDevAgent = async (prompt, context) => {
    // Fügen Sie hier die tatsächliche Logik für den Dev Agenten-Aufruf ein
    const response = await apiClient.post('/api/agent/dev', { prompt, context });
    return response.data;
};

export const callFrontendDevAgent = async (prompt, context) => {
    // Fügen Sie hier die tatsächliche Logik für den Frontend Dev Agenten-Aufruf ein
    const response = await apiClient.post('/api/agent/frontend', { prompt, context });
    return response.data;
};

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