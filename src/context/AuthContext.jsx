import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hilfsfunktion: Tokens aus dem LocalStorage und den User-State synchronisieren.
    // Wird für den traditionellen Login benötigt, da hier Tokens direkt in der JSON-Antwort kommen.
    const loginUser = useCallback((userData, tokens = null) => {
        // Diese Logik ist notwendig, falls der Standard-Login die Tokens in der JSON-Antwort liefert.
        if (tokens && tokens.access_token) {
            localStorage.setItem('access_token', tokens.access_token);
            if (tokens.refresh_token) {
                localStorage.setItem('refresh_token', tokens.refresh_token);
            }
        }
        setUser(userData);
        setError(null);
        console.log('[Auth] User State synchronisiert (via Standard-Login)');
    }, []);

    // Hilfsfunktion: Logout (Token entfernen und State löschen)
    const logoutUser = useCallback(async () => {
        // OPTIONAL: Backend-Logout aufrufen, um ggf. Refresh-Token zu invalidieren
        await logout(); 

        // Tokens aus LocalStorage entfernen (nur für den Standard-Login-Pfad nötig)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        setUser(null);
        setError(null);
        console.log('[Auth] Logout erfolgreich.');
    }, []);

    // Hauptfunktion: Prüft, ob User eingeloggt ist (via Cookie oder LocalStorage Token)
    const checkAuth = useCallback(async () => {
        // Beim Aufruf von getCurrentUser() wird folgendes passieren:
        // 1. Der Browser sendet automatisch das HttpOnly-Cookie (OAuth-Flow).
        // 2. Deine apiClient/Interceptor hängt ggf. das LocalStorage-Token an (Standard-Login-Flow).
        // WICHTIG: KEINE Token-Prüfung hier im Frontend, wir verlassen uns auf den HTTP-Request.

        try {
            setLoading(true);
            const data = await getCurrentUser(); 

            // Stelle sicher, dass du das richtige User-Objekt extrahierst
            const userData = data.user || data; 
            
            setUser(userData);
            setError(null);
            console.log('[Auth] checkAuth: Backend hat User validiert.', userData.id);
            return userData;

        } catch (err) {
            console.warn('[Auth] checkAuth fehlgeschlagen. Token/Cookie ungültig oder fehlt.');
            
            // Bei Fehler Tokens aus LocalStorage entfernen (für Standard-Login)
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            setUser(null);
            return null;

        } finally {
            setLoading(false);
        }
    }, []);

    // Initialer Effekt: Führt den ersten Auth-Check beim App-Start durch
    useEffect(() => {
        const initAuth = async () => {
            console.log('[Auth Initialisierung] Starte Überprüfung...');
            
            // 1. TOKEN-BEREINIGUNG (Wichtig für OAuth-Redirect)
            // Prüft, ob wir gerade von einem OAuth-Redirect mit URL-Parametern kommen.
            // Im Cookie-Only-Flow sollte dein Backend KEINE URL-Parameter mehr senden.
            // Falls doch, entfernen wir sie hier, damit sie nicht im LocalStorage landen
            // und der Cookie-Flow korrekt getestet wird.
            
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has('access_token')) {
                // Tokens sind in der URL, das ist der alte Flow. Wir bereinigen.
                console.warn('[Auth Initialisierung] Tokens in URL gefunden. URL wird bereinigt.');
                
                // WICHTIG: URL bereinigen, damit der User die Tokens nicht sieht
                // und damit beim Refresh nicht erneut "eingeloggt" wird.
                const newUrl = window.location.pathname; 
                window.history.replaceState({}, document.title, newUrl);
            }

            // 2. Auth-Check durchführen (prüft Cookie/Local-Token)
            await checkAuth();
            console.log('[Auth Initialisierung] Überprüfung abgeschlossen.');
        };

        initAuth();
    }, [checkAuth]); // checkAuth ist stabil dank useCallback

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        loginUser,
        logoutUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};