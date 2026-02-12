# 🪑 Stuhl Stefan - Buchungssystem mit Brevo Email-Integration

## Überblick

Dieses Projekt ist ein Buchungssystem für den Stuhl Stefan mit automatischer Email-Bestätigung per Brevo (ehemals Sendinblue).

## Features

- ✅ Modernes Buchungsformular
- ✅ Automatische Email-Bestätigung via Brevo
- ✅ Preisberechnung (15€/Stunde)
- ✅ Eingabevalidierung
- ✅ Responsive Design
- ✅ RESTful API Backend

## Setup

### 1. Dependencies installieren

```bash
npm install
```

Dies installiert:
- `express` - Web Framework
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Umgebungsvariablen
- `axios` - HTTP Client für Brevo API

### 2. Brevo API Key besorgen

1. Registriere dich bei [Brevo](https://app.brevo.com)
2. Gehe zu "Settings" → "API Keys"
3. Kopiere deinen API Key

### 3. Umgebungsvariablen konfigurieren

```bash
# Kopiere das Example
cp .env.example .env

# Bearbeite .env und füge deinen API Key ein
nano .env
```

Beispiel `.env`:
```
BREVO_API_KEY=xkeysb123456789abcdefghijklmnop
PORT=3000
```

### 4. Server starten

```bash
npm start
```

Der Server läuft dann auf `http://localhost:3000`

## API Endpoints

### POST /api/book
Neue Buchung erstellen und Email senden

**Request Body:**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "phone": "+49123456789",
  "date": "2026-02-15",
  "time": "14:00",
  "duration": "2",
  "message": "Mit Kissen bitte"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Buchung erfolgreich erstellt!",
  "bookingId": "STEFAN-1707767890123",
  "booking": { ... }
}
```

### GET /api/bookings
Alle Buchungen abrufen (Admin)

### GET /api/health
Health Check

## Email-Bestätigung

Die Bestätigungsmail enthält:
- 📋 Vollständige Buchungsdetails
- 💰 Gesamtpreis
- 📅 Datum und Uhrzeit
- 📞 Kontaktinformationen
- 🔗 Link zum Support

## Datei-Struktur

```
/
├── index.html              # Startseite
├── stefan-booking.html     # Buchungsformular
├── server.js              # Express Backend
├── package.json           # Dependencies
├── .env.example           # Beispiel Konfiguration
├── .env                   # Aktuelle Konfiguration (nicht in Git)
└── README-SETUP.md        # Diese Datei
```

## Troubleshooting

### Email wird nicht gesendet
- ✓ Überprüfe ob `BREVO_API_KEY` in `.env` gesetzt ist
- ✓ Kontrolliere die Brevo API Verbindung
- ✓ Schaue in der Server-Konsole nach Fehlern

### Port 3000 ist bereits in Verwendung
```bash
# Anderer Port
PORT=3001 npm start

# Oder: Finde den Prozess
lsof -i :3000
kill -9 <PID>
```

### CORS-Fehler
Falls die Frontend nicht mit dem Backend kommunizieren kann:
- ✓ Stelle sicher dass der Server läuft
- ✓ Überprüfe die URL in der Browser-Konsole
- ✓ CORS ist in `server.js` already enabled

## Production Deployment

Für Production-Umgebungen:

1. **Datenbank hinzufügen** - Ersetze das In-Memory Array durch eine richtige Datenbank
2. **Email-Validierung** - Implementiere Double-Opt-In
3. **Rate Limiting** - Beschütze vor Spam/Brute-Force
4. **HTTPS** - Verwende immer HTTPS in Production
5. **Admin Dashboard** - Erstelle ein Dashboard zur Buchungsverwaltung

## Support

Bei Fragen oder Problemen schaue in die Log-Ausgabe der Server-Konsole 📺

---

**Entwickler:** NDBGHG  
**Lizenz:** MIT  
**Erstellt:** Februar 2026
