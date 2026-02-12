require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store bookings (in production, use a database)
const bookings = [];

// Email template function
const generateConfirmationEmail = (booking) => {
    const totalPrice = (booking.duration * 15.00).toFixed(2);
    
    return {
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
                    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
                    .label { font-weight: bold; color: #667eea; }
                    .price { font-size: 24px; color: #667eea; font-weight: bold; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🪑 Stuhl Stefan - Buchungsbestätigung</h1>
                    </div>
                    <div class="content">
                        <p>Hallo <strong>${booking.name}</strong>,</p>
                        <p>vielen Dank für deine Buchung! Wir freuen uns, dir bald Stefan zur Verfügung zu stellen.</p>
                        
                        <div class="booking-details">
                            <h3>📋 Buchungsdetails</h3>
                            <div class="detail-row">
                                <span class="label">Buchungs-ID:</span>
                                <span>#${booking.id}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Datum:</span>
                                <span>${new Date(booking.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Uhrzeit:</span>
                                <span>${booking.time} Uhr</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Dauer:</span>
                                <span>${booking.duration} Stunde(n)</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Telefon:</span>
                                <span>${booking.phone}</span>
                            </div>
                            ${booking.message ? `
                            <div class="detail-row">
                                <span class="label">Besondere Wünsche:</span>
                                <span>${booking.message}</span>
                            </div>
                            ` : ''}
                        </div>

                        <div class="booking-details">
                            <h3>💰 Zahlungsinformation</h3>
                            <div class="detail-row">
                                <span class="label">Preis pro Stunde:</span>
                                <span>15,00 €</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Anzahl Stunden:</span>
                                <span>${booking.duration}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Gesamtpreis:</span>
                                <span class="price">${totalPrice} €</span>
                            </div>
                        </div>

                        <p><strong>Nächste Schritte:</strong></p>
                        <ul>
                            <li>Wir bestätigen deine Buchung innerhalb von 24 Stunden</li>
                            <li>Du erhältst eine zweite Email mit den Abholdetails</li>
                            <li>Bei Fragen kontaktiere uns gerne</li>
                        </ul>

                        <p>Vielen Dank,<br><strong>Das Stuhl Stefan Team</strong></p>

                        <div class="footer">
                            <p>Dies ist eine automatische Email. Bitte antworte nicht direkt auf diese Nachricht.</p>
                            <p>&copy; 2026 Stuhl Stefan. Alle Rechte vorbehalten.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// Booking endpoint
app.post('/api/book', async (req, res) => {
    try {
        const { name, email, phone, date, time, duration, message } = req.body;

        // Validate input
        if (!name || !phone || !date || !time || !duration) {
            return res.status(400).json({ 
                success: false, 
                error: 'Alle erforderlichen Felder müssen ausgefüllt sein' 
            });
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Ungültige Email-Adresse' 
                });
            }
        }

        // Create booking
        const booking = {
            id: 'STEFAN-' + Date.now(),
            name,
            email,
            phone,
            date,
            time,
            duration: parseInt(duration),
            message: message || '',
            createdAt: new Date().toISOString()
        };

        bookings.push(booking);

        // Send email confirmation via Brevo (only if email provided)
        if (email && BREVO_API_KEY) {
            try {
                const emailContent = generateConfirmationEmail(booking);
                
                await axios.post('https://api.brevo.com/v3/smtp/email', {
                    sender: {
                        name: 'Stuhl Stefan',
                        email: 'noreply@stuhlstefan.de'
                    },
                    to: [
                        {
                            email: email,
                            name: name
                        }
                    ],
                    subject: '🪑 Buchungsbestätigung - Stuhl Stefan #' + booking.id,
                    htmlContent: emailContent.htmlContent,
                    replyTo: {
                        email: 'kontakt@stuhlstefan.de'
                    }
                }, {
                    headers: {
                        'api-key': BREVO_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('✓ Email gesendet an:', email);
            } catch (emailError) {
                console.error('Email-Fehler:', emailError.message);
                // Don't fail the booking if email fails, just log it
            }
        } else {
            if (!email) {
                console.warn('⚠️ Keine Email-Adresse angegeben. Keine Bestätigung gesendet.');
            } else {
                console.warn('⚠️ BREVO_API_KEY nicht gesetzt. Lokale Email-Simulation.');
                console.log('Email würde gesendet an:', email);
            }
        }

        res.json({ 
            success: true, 
            message: 'Buchung erfolgreich erstellt!',
            bookingId: booking.id,
            booking: booking
        });

    } catch (error) {
        console.error('Fehler bei Buchung:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' 
        });
    }
});

// Get bookings (admin endpoint)
app.get('/api/bookings', (req, res) => {
    res.json({ bookings: bookings });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        brevoConfigured: !!BREVO_API_KEY
    });
});

// Serve index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/stefan-booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'stefan-booking.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
    console.log(`Brevo Integration: ${BREVO_API_KEY ? '✓ Aktiviert' : '⚠️ Nicht konfiguriert'}`);
});
