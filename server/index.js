require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ms9409621877:Mukul_%401201@cluster0.l0eloyz.mongodb.net/BrainRace?appName=Cluster0';

console.log('Attempting to connect to MongoDB...');
const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
console.log('Target:', maskedUri);

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('✅ Connected to MongoDB Atlas!'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('👉 ACTION REQUIRED: Check if your IP is whitelisted in MongoDB Atlas (Network Access tab).');
    });

// Basic Schema for storing scores
const ScoreSchema = new mongoose.Schema({
    playerName: String,
    score: Number,
    date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', ScoreSchema);

// User Schema for Auth and Stats
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// Question Schema
const QuestionSchema = new mongoose.Schema({
    gameType: { type: String, required: true },
    questionText: String,
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    points: { type: Number, default: 10 }
});

const Question = mongoose.model('Question', QuestionSchema);


const app = express();

app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Middleware to check database connection
app.use((req, res, next) => {
    if (req.path.startsWith('/api') && req.path !== '/api/health' && mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database connection is not ready.',
            details: 'Please check if your IP is whitelisted in MongoDB Atlas (Network Access tab).'
        });
    }
    next();
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        time: new Date()
    });
});

if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../client/dist')));
}

const server = http.createServer(app);

// ✅ FIX 1: Remove spaces from App Password
const EMAIL_USER = process.env.EMAIL_USER || 'ms9409621877@gmail.com';
const EMAIL_PASS = (process.env.EMAIL_PASS || 'mjhlkeosmwggsnid').replace(/\s/g, ''); // strip spaces just in case

console.log('📧 Email config — user:', EMAIL_USER, '| pass length:', EMAIL_PASS.length);

// ✅ FIX 2: Use port 587 + STARTTLS (more reliable than 465 on most hosting)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,      // false = STARTTLS on port 587
    requireTLS: true,   // force upgrade to TLS
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    logger: false,
    debug: false
});

// Verify SMTP connection at startup
transporter.verify()
    .then(() => console.log('✅ SMTP server is ready to send emails'))
    .catch(err => {
        console.error('❌ SMTP verification failed:', err.message);
        console.log('👉 ACTION REQUIRED: Make sure EMAIL_PASS is a valid Gmail App Password (no spaces, 16 chars).');
        console.log('   Generate one at: https://myaccount.google.com/apppasswords');
    });

// Email health check endpoint
app.get('/api/email-health', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ status: 'ok', message: 'SMTP connection verified', user: EMAIL_USER });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            code: err.code,
            user: EMAIL_USER
        });
    }
});

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        email = email.trim().toLowerCase();
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: 'Email already exists' });

        const user = await User.create({ name, email, password });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        email = email.trim().toLowerCase();
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const userObj = user.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ FIX 3: Robust OTP route with detailed error handling
app.post('/api/request-otp', async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found with this email' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Use updateOne to avoid triggering the pre-save password hash hook
        await User.updateOne({ email }, { $set: { otp, otpExpires } });

        const mailOptions = {
            from: `"BrainRace Support" <${EMAIL_USER}>`,
            to: email,
            subject: 'Your BrainRace OTP Code',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #050510; color: #fff; border-radius: 20px;">
                    <h1 style="color: #22d3ee; text-align: center; font-style: italic;">BRAINRACE</h1>
                    <p style="font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.7);">Hello Racer,</p>
                    <p style="font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.7);">Use the following code to access your racing profile:</p>
                    <div style="background: rgba(34,211,238,0.1); border: 2px solid #22d3ee; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #fff;">${otp}</span>
                    </div>
                    <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        // ✅ FIX 4: Await sendMail and capture result
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent:', info.messageId, '→', email);

        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('❌ OTP Send Error — code:', err.code, '| message:', err.message);

        let userMessage = 'Failed to send OTP. ';
        if (err.code === 'EAUTH') {
            userMessage += 'Email authentication failed. The Gmail App Password is invalid or expired. Generate a new one at https://myaccount.google.com/apppasswords';
        } else if (err.code === 'ESOCKET' || err.code === 'ECONNECTION' || err.code === 'ECONNREFUSED') {
            userMessage += 'Could not connect to email server. Please try again later.';
        } else if (err.code === 'ETIMEDOUT') {
            userMessage += 'Email server timed out. Please try again.';
        } else if (err.responseCode === 535) {
            userMessage += 'Gmail authentication error (535). Make sure you are using an App Password, not your Gmail account password.';
        } else {
            userMessage += `Please try again later. (${err.code || err.message})`;
        }

        res.status(500).json({ error: userMessage });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        email = email.trim().toLowerCase();
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const user = await User.findOne({
            email,
            otp: otp.toString().trim(),
            otpExpires: { $gt: new Date() }
        });

        if (!user) return res.status(401).json({ error: 'Invalid or expired OTP' });

        // Clear OTP after successful use without triggering pre-save password hook
        await User.updateOne({ email }, { $unset: { otp: 1, otpExpires: 1 } });

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpires;
        res.json(userObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/user/:name', async (req, res) => {
    try {
        const user = await User.findOne({ name: req.params.name }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topScores = await Score.find().sort({ score: -1 }).limit(10);
        res.json(topScores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/update-score', async (req, res) => {
    try {
        const { playerName, score } = req.body;
        if (!playerName) return res.status(400).json({ error: 'Player name is required' });

        await Score.create({ playerName, score });
        const user = await User.findOneAndUpdate(
            { name: playerName },
            { $inc: { totalScore: score, gamesPlayed: 1 } },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin/Teacher Routes
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');

        const scores = await Score.aggregate([
            { $group: { _id: "$playerName", totalScore: { $sum: "$score" }, lastPlayed: { $max: "$date" }, count: { $sum: 1 } } }
        ]);

        const students = [...users];

        scores.forEach(s => {
            if (!students.find(u => u.name === s._id)) {
                students.push({
                    name: s._id,
                    totalScore: s.totalScore,
                    gamesPlayed: s.count,
                    role: 'guest',
                    isLegacy: true
                });
            }
        });

        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { totalScore, gamesPlayed } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { totalScore, gamesPlayed }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Question Management Routes
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/questions', async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/questions/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/questions/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId, playerName, team, gameType = 'endless' }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = {
                scores: { Red: 0, Blue: 0 },
                players: [],
                status: 'waiting',
                gameType: gameType
            };
        }

        const existingPlayer = rooms[roomId].players.find(p => p.playerName === playerName);
        if (!existingPlayer) {
            rooms[roomId].players.push({ id: socket.id, playerName, team });
        } else {
            existingPlayer.id = socket.id;
            existingPlayer.team = team;
        }

        socket.emit('roomUpdate', rooms[roomId]);
        socket.emit('scoreUpdate', rooms[roomId].scores);
        socket.to(roomId).emit('roomUpdate', rooms[roomId]);
    });

    socket.on('startGame', ({ roomId, gameType }) => {
        if (rooms[roomId]) {
            rooms[roomId].status = 'playing';
            if (gameType) rooms[roomId].gameType = gameType;
            io.to(roomId).emit('multiplayerStart', { gameType: rooms[roomId].gameType });
        }
    });

    socket.on('submitAnswer', ({ roomId, isCorrect, team, points = 10 }) => {
        if (rooms[roomId] && isCorrect) {
            rooms[roomId].scores[team] += points;
            io.to(roomId).emit('scoreUpdate', rooms[roomId].scores);

            if (rooms[roomId].scores[team] >= 200) {
                io.to(roomId).emit('gameOver', { winner: team });

                rooms[roomId].players.forEach(async (p) => {
                    try {
                        const finalScore = rooms[roomId].scores[p.team];
                        await Score.create({ playerName: p.playerName, score: finalScore });
                        await User.findOneAndUpdate(
                            { name: p.playerName },
                            { $inc: { totalScore: finalScore, gamesPlayed: 1 } }
                        );
                    } catch (err) {
                        console.error('Error saving score:', err);
                    }
                });

                rooms[roomId].scores = { Red: 0, Blue: 0 };
                rooms[roomId].status = 'finished';
            }
        }
    });

    socket.on('playerUpdate', (data) => {
        if (data.roomId) {
            socket.to(data.roomId).emit('opponentUpdate', {
                id: socket.id,
                ...data
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
            } else {
                io.to(roomId).emit('roomUpdate', rooms[roomId]);
            }
        }
    });
});

// SPA catch-all — MUST be after all API routes
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});