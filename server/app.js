require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const twilio = require('twilio');
const { connectDb, getDb } = require('./db');

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: "*",
    credentials: true // Allow cookies to be sent
}));

const otpCache = new Map();

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

connectDb().then(() => {
    console.log('Connected to MongoDB');
});

// Send OTP (signup or login)
app.post('/auth-api/send-otp', async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone required' });

        const db = getDb();
        const usersCol = db.collection('users');

        if (email) {
            const existing = await usersCol.findOne({ phone });
            if (!existing) {
                await usersCol.insertOne({
                    email,
                    phone,
                    createdAt: new Date()
                });
            }
        }

        const code = crypto.randomInt(100000, 999999).toString();
        otpCache.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 });

        await twilioClient.messages.create({
            body: `Your openmca login code is ${code}`,
            from: process.env.TWILIO_PHONE,
            to: phone
        });
        console.log(code)
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify OTP & create session
app.post('/auth-api/verify-otp', async (req, res) => {
    try {
        const { phone, code } = req.body;
        const otpData = otpCache.get(phone);
        if (!otpData || otpData.code !== code || Date.now() > otpData.expires) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
        otpCache.delete(phone);

        const db = getDb();
        const usersCol = db.collection('users');
        const sessionsCol = db.collection('sessions');

        const user = await usersCol.findOne({ phone });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const sessionId = crypto.randomUUID();

        // Single active session
        await sessionsCol.deleteMany({ userId: user._id });
        await sessionsCol.insertOne({
            userId: user._id,
            sessionId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify session (for Nginx auth_request)
app.get('/auth-api/verify', async (req, res) => {
    try {
        const sessionId = req.cookies.session_id;
        if (!sessionId) return res.sendStatus(401);

        const db = getDb();
        const sessionsCol = db.collection('sessions');

        const session = await sessionsCol.findOne({
            sessionId,
            expiresAt: { $gt: new Date() }
        });

        if (!session) return res.sendStatus(401);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error verifying session');
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Auth server running on port ${process.env.PORT || 3000}`);
});
