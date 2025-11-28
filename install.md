# Installation & Setup Guide

## 🚀 Schnellstart

### 1. Projekt Setup

```bash
# Neues CRA Projekt erstellen
npx create-react-app ai-agent-frontend

# In Projekt-Ordner wechseln
cd ai-agent-frontend
```

### 2. Dateien erstellen

Erstelle folgende Ordnerstruktur:

```bash
# API Ordner
mkdir -p src/api/services

# Components
mkdir -p src/components/layout
mkdir -p src/components/workflow

# Pages
mkdir -p src/pages/auth
mkdir -p src/pages/workflow
mkdir -p src/pages/agents
mkdir -p src/pages/documents
mkdir -p src/pages/knowledge
mkdir -p src/pages/token
mkdir -p src/pages/settings

# Andere
mkdir -p src/routes
mkdir -p src/store
mkdir -p src/theme
```

### 3. package.json ersetzen

Ersetze die generierte `package.json` mit dieser:

```json
{
  "name": "ai-agent-frontend",
  "version": "1.0.0",
  "description": "React 19 Frontend for AI Agent Platform with Material UI",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.15.10",
    "@mui/material": "^5.15.10",
    "axios": "^1.6.7",
    "framer-motion": "^11.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.4.7",
    "date-fns": "^3.0.0",
    "dompurify": "^3.0.6",
    "react-markdown": "^9.0.1",
    "recharts": "^2.10.3",
    "http-proxy-middleware": "^2.0.6"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.0",
    "cross-env": "^10.1.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "cross-env HTTPS=true SSL_CRT_FILE=./127.0.0.1.pem SSL_KEY_FILE=./127.0.0.1-key.pem react-scripts start --host 0.0.0.0",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "https://127.0.0.1:8443"
}
```

### 4. Dependencies installieren

```bash
npm install
```

### 5. Alle Dateien kopieren

Kopiere alle bereitgestellten Dateien in die entsprechenden Ordner gemäß der Projektstruktur:

**API:**
- `src/api/client.js`
- `src/api/services/authService.js`
- `src/api/services/agentService.js`
- `src/api/services/workflowService.js`
- `src/api/services/documentService.js`
- `src/api/services/knowledgeService.js`
- `src/api/services/tokenService.js`

**Components:**
- `src/components/layout/MainLayout.jsx`
- `src/components/layout/Header.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/workflow/EmailPreviewCard.jsx`

**Pages:**
- `src/pages/auth/Login.jsx`
- `src/pages/auth/Register.jsx`
- `src/pages/auth/ForgotPassword.jsx`
- `src/pages/auth/ResetPassword.jsx`
- `src/pages/workflow/WorkflowList.jsx`
- `src/pages/workflow/WorkflowDetail.jsx`
- `src/pages/workflow/EmailPreview.jsx`
- `src/pages/agents/PersonalAssistant.jsx`
- `src/pages/agents/FrontendGenerator.jsx`
- `src/pages/documents/Documents.jsx`
- `src/pages/documents/DocumentDetail.jsx`
- `src/pages/knowledge/KnowledgeBase.jsx`
- `src/pages/knowledge/KnowledgeDetail.jsx`
- `src/pages/token/TokenUsage.jsx`
- `src/pages/settings/Settings.jsx`
- `src/pages/settings/Profile.jsx`
- `src/pages/Dashboard.jsx`

**Configuration:**
- `src/routes/routes.jsx`
- `src/store/authStore.js`
- `src/store/workflowStore.js`
- `src/store/themeStore.js`
- `src/theme/theme.js`
- `src/setupProxy.js`
- `src/App.jsx`
- `src/main.jsx`

**Root:**
- `public/index.html`
- `.env` (aus .env.example)

### 6. SSL Zertifikate

Stelle sicher, dass die SSL Zertifikate im Root-Verzeichnis liegen:
- `127.0.0.1.pem`
- `127.0.0.1-key.pem`

**Zertifikate generieren (falls nicht vorhanden):**

```bash
# macOS/Linux
mkcert 127.0.0.1

# Windows (mit mkcert installiert)
mkcert 127.0.0.1
```

### 7. Environment Variables

Erstelle `.env` Datei:

```bash
HTTPS=true
SSL_CRT_FILE=./127.0.0.1.pem
SSL_KEY_FILE=./127.0.0.1-key.pem
```

### 8. App starten

```bash
npm start
```

Die App läuft jetzt auf: **https://localhost:3000**

---

## 🔧 Troubleshooting

### Problem: "Cannot find module"

**Lösung:** Dependencies neu installieren
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: SSL Zertifikat Fehler

**Lösung 1:** Zertifikate neu generieren
```bash
npm install -g mkcert
mkcert -install
mkcert 127.0.0.1
```

**Lösung 2:** HTTPS deaktivieren (nicht empfohlen)
```bash
# In package.json "start" script HTTPS=true entfernen
"start": "react-scripts start"
```

### Problem: API Requests schlagen fehl

**Prüfen:**
1. Backend läuft auf `https://127.0.0.1:8443`
2. `src/setupProxy.js` ist vorhanden
3. Proxy in `package.json` ist korrekt

**Test:**
```bash
curl -k https://127.0.0.1:8443/health
```

### Problem: React 19 Kompatibilität

Falls Fehler mit React 19 auftreten:
```bash
# Force Resolution in package.json
"overrides": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Problem: Module not found: Can't resolve 'zustand'

**Lösung:** Zustand fehlt in Dependencies
```bash
npm install zustand
```

---

## 📝 Checkliste vor dem Start

- [ ] Node.js >= 18.x installiert
- [ ] Alle Ordner erstellt
- [ ] package.json ersetzt
- [ ] `npm install` ausgeführt
- [ ] Alle 43 Dateien kopiert
- [ ] SSL Zertifikate im Root
- [ ] `.env` Datei erstellt
- [ ] Backend läuft auf Port 8443
- [ ] `npm start` erfolgreich

---

## 🎯 Nach der Installation

### 1. Login testen
1. Öffne https://localhost:3000
2. Klicke auf "Jetzt registrieren"
3. Registriere einen Test-User
4. Logge dich ein

### 2. Dashboard erkunden
- Sieh dir die Quick Actions an
- Überprüfe Token Usage
- Schaue in die Workflows

### 3. Personal Assistant testen
1. Navigiere zu "Personal Assistant"
2. Gib einen Test-Prompt ein
3. Beobachte den Status

### 4. Workflow Email Management testen
1. Erstelle Workflow mit Email
2. Öffne Workflow Details
3. Teste Email Vorschau
4. Sende oder lehne ab

---

## 🔍 Verifikation

### API Endpunkte testen

```bash
# Health Check
curl -k https://127.0.0.1:8443/health

# Mit Credentials
curl -k -X POST https://127.0.0.1:8443/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
```

### Frontend Build testen

```bash
npm run build
```

Build sollte erfolgreich sein und `build/` Ordner erstellen.

---

## 📚 Weitere Ressourcen

- **API Dokumentation:** Siehe bereitgestellte API-Dokumentation
- **API Coverage:** `API_COVERAGE.md`
- **Projekt Struktur:** `PROJECT_STRUCTURE.md`
- **README:** `README.md`

---

## 🎉 Erfolg!

Wenn alles funktioniert:
- ✅ App läuft auf https://localhost:3000
- ✅ Backend erreichbar
- ✅ Login funktioniert
- ✅ Dashboard wird angezeigt
- ✅ Alle Features verfügbar

**Happy Coding! 🚀**