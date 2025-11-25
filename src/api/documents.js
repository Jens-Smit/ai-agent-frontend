import apiClient from './client';
import { getErrorMessage } from './client';



/**
 * Dokument hochladen
 */
export const uploadDocument = async (formData) => {
    try {
        // Axios erkennt das FormData-Objekt und setzt automatisch den Content-Type
        // auf 'multipart/form-data', was für Datei-Uploads notwendig ist.
        const response = await apiClient.post('/api/documents', formData);
        return response.data;
    } catch (error) {
        // Verwendung des zentralen Fehler-Handlers
        const message = getErrorMessage(error);
        console.error("Dokument-Upload Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Liste aller hochgeladenen Dokumente
 */
export const listDocuments = async (category = null, type = null, limit = 50) => {
    const params = {};
    if (category) params.category = category;
    if (type) params.type = type;
    if (limit) params.limit = limit;
    
    // Die fetchDocuments-Funktion wird durch diese Funktion ersetzt, 
    // um die Query-Parameter zu unterstützen.
    const response = await apiClient.get('/api/documents', { params });
    return response.data;
};

/**
 * Dokumente durchsuchen
 */
export const searchDocuments = async (query, limit = 20) => {
    try {
        const response = await apiClient.get('/api/documents/search', {
            params: { q: query, limit },
        });
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Dokument-Search Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Dokument-Details abrufen
 */
export const getDocument = async (id) => {
    try {
        const response = await apiClient.get(`/api/documents/${id}`);
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Dokument-Details Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Dokument herunterladen
 */
export const downloadDocument = async (id) => {
    try {
        const response = await apiClient.get(`/api/documents/${id}/download`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Dokument-Download Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Dokument-Metadaten aktualisieren
 */
export const updateDocument = async (id, data) => {
    try {
        const response = await apiClient.put(`/api/documents/${id}`, data);
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Dokument-Update Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Dokument löschen
 */
export const deleteDocument = async (id) => {
    try {
        const response = await apiClient.delete(`/api/documents/${id}`);
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Dokument-Löschen Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Dokument in Knowledge Base indizieren
 */
export const indexDocument = async (id, tags = null) => {
    try {
        const response = await apiClient.post(`/api/documents/${id}/index`, { tags });
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Dokument-Indizierung Fehler:", message, error);
        throw new Error(message);
    }
};

/**
 * Speicherstatistiken abrufen
 */
export const getStorageStats = async () => {
    try {
        const response = await apiClient.get('/api/documents/storage/stats');
        return response.data;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Speicher-Statistik Fehler:", message, error);
        throw new Error(message);
    }
};