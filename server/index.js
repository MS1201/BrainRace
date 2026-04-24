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
// Mask password in logs
const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
console.log('Target:', maskedUri);

// mongoose.set('bufferCommands', false); // Removed to avoid immediate crashes

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
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

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// Question Schema
const QuestionSchema = new mongoose.Schema({
    gameType: { type: String, required: true }, // e.g., 'logic-flow', 'memory-matrix'
    questionText: String,
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    points: { type: Number, default: 10 }
});

const Question = mongoose.model('Question', QuestionSchema);


const app = express();
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Middleware to check database connection
app.use((req, res, next) => {
    // Only check for API routes
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

// Serve static files from the client/dist folder in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        }
    });
}

const server = http.createServer(app);

// Nodemailer Config
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER || 'ms9409621877@gmail.com',
        pass: process.env.EMAIL_PASS || 'mgsi pvoz ohxw pixb'
    }
});

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
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
        const { email, password } = req.body;
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

app.post('/api/request-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found with this email' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        // Use updateOne to avoid triggering the pre-save password hash hook
        await User.updateOne({ email }, { $set: { otp, otpExpires } });

        const mailOptions = {
            from: '"BrainRace Support" <ms9409621877@gmail.com>',
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

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('OTP Send Error:', err);
        res.status(500).json({ error: 'Failed to send OTP. Please check your email configuration.' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
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
        res.json(users);
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
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId, playerName, team }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = {
                scores: { Red: 0, Blue: 0 },
                players: [],
                status: 'waiting'
            };
        }

        // Avoid duplicate players if they reconnect
        const existingPlayer = rooms[roomId].players.find(p => p.playerName === playerName);
        if (!existingPlayer) {
            rooms[roomId].players.push({ id: socket.id, playerName, team });
        } else {
            existingPlayer.id = socket.id;
        }

        io.to(roomId).emit('roomUpdate', rooms[roomId]);
    });

    socket.on('startGame', ({ roomId }) => {
        if (rooms[roomId]) {
            rooms[roomId].status = 'playing';
            io.to(roomId).emit('multiplayerStart');
        }
    });

    socket.on('submitAnswer', ({ roomId, isCorrect, team, points = 10 }) => {
        if (rooms[roomId] && isCorrect) {
            rooms[roomId].scores[team] += points;
            io.to(roomId).emit('scoreUpdate', rooms[roomId].scores);

            if (rooms[roomId].scores[team] >= 200) { // Increased limit for longer games
                io.to(roomId).emit('gameOver', { winner: team });

                // Save scores to MongoDB
                rooms[roomId].players.forEach(async (p) => {
                    try {
                        const finalScore = rooms[roomId].scores[p.team];
                        await Score.create({
                            playerName: p.playerName,
                            score: finalScore
                        });
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
        // Broadcast player state to others in the same room
        if (data.roomId) {
            socket.to(data.roomId).emit('opponentUpdate', {
                id: socket.id,
                ...data
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Clean up empty rooms or remove players
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
