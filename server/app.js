require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const twilio = require('twilio');
const { connectDb, getDb } = require('./db');

const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 5, // limit each IP to 5 requests per window
  message: { error: 'Too many OTP requests, please try again later' }
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin: "*",
    credentials: true // Allow cookies to be sent
}));

const otpCache = new Map();

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

async function isMobileNumber(e164) {
  const resp = await twilioClient.lookups.v2
    .phoneNumbers(e164)
    .fetch({ fields: "line_type_intelligence" });
  const type = resp.lineTypeIntelligence?.type;
  console.log(`phone:${e164},type:${type}`)
  return type === "mobile";
}

connectDb().then(() => {
    console.log('Connected to MongoDB');
});

// Send OTP (signup or login)
app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
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
        }else{
          const existing = await usersCol.findOne({ phone });
          if(!existing){
             return res.status(500).json({ error: "User account does not exist, please register" });
          }  
        }
        
        const code = crypto.randomInt(100000, 999999).toString();
        otpCache.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 });
        const isvalid = await isMobileNumber(phone)
        if(!isvalid){
            return res.status(500).json({ error: "Enter valid mobile phone number (No internet-based services)" })
        }
        await twilioClient.messages.create({
            body: `Your openmca login code is ${code}`,
            from: process.env.TWILIO_PHONE,
            to: phone
        });
        console.log(code)
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Verify OTP & create session
///       /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
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
        res.status(500).json({ error: err.message });
    }
});

// Verify session (for Nginx auth_request)
app.get('/api/auth/verify', async (req, res) => {
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
app.post('/api/auth/logout', async ()=>{
    try {
        const sessionId = req.cookies.session_id;
        if (!sessionId) return res.sendStatus(200);

        const db = getDb();
        const sessionsCol = db.collection('sessions');

        await sessionsCol.findOneAndDelete({
            sessionId});
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(200)
    }
})
app.listen(process.env.PORT || 3000, () => {
    console.log(`Auth server running on port ${process.env.PORT || 3000}`);
});
