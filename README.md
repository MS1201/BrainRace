# 🧠 BrainRace

BrainRace is a premium, high-performance brain-training platform featuring a suite of interactive games designed to challenge and improve various cognitive skills. Built with a modern React frontend and a robust backend, BrainRace offers 1 stunning visual experience with smooth animations and dynamic gameplay.

## 🚀 Features

- **🎮 Diverse Games**:
  - **Memory Matrix**: Enhance your spatial memory.
  - **Logic Flow**: Solve complex puzzles under pressure.
  - **Brain Buddy**: Interactive trivia and cognitive challenges.
  - **Endless Runner**: Fast-paced action requiring quick reflexes.
  - **Math Drops**: Mental arithmetic challenges.
- **✨ Premium UI/UX**: Dark-themed, glassmorphic design for a modern feel.
- **📊 Performance Tracking**: Monitor your progress as you train your brain.
- **🔒 Secure Platform**: Full authentication system for managing your training sessions.

## 🛠️ Tech Stack

- **Frontend**: React, JavaScript (ES6+), Vanilla CSS.
- **Backend**: Node.js/Express.
- **Tooling**: Git for version control.

## 💻 Local Development

1. Install and start **MongoDB Community Server**. MongoDB Compass is a GUI client and does not run the database server itself.
2. Copy `server/.env.example` to `server/.env`.
3. Keep the example `MONGO_URI` to use a local MongoDB database named `BrainRace`. If you use Atlas instead, put its connection string in `MONGO_URI`.
4. In MongoDB Compass, connect using the same URI (for a local database, `mongodb://127.0.0.1:27017`). The `BrainRace` database and its collections appear after the app first writes data.
5. Install dependencies with `npm run install:all`, then start the app with `npm run dev`.

Set `EMAIL_USER` and `EMAIL_PASS` in `server/.env` if you want to enable OTP email sending. They are optional for local database development.

Game results are stored in the `scores` collection in the database selected by `MONGO_URI`. The player's `totalScore` and `gamesPlayed` are updated in the `users` collection. Use the database name in your MongoDB URI when locating these collections in Compass or Atlas.

## ☁️ Deployment Guide (Render + MongoDB Atlas)

### 1. Database Setup
- Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/).
- Add your IP address to the whitelist and create a database user.
- Copy your connection string.

### 2. Cloud Hosting (Render)
- Connect your GitHub repo to [Render.com](https://render.com).
- Create a new **Web Service**.
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment Variables**:
  - `MONGO_URI`: Your Atlas connection string.
  - `NODE_ENV`: `production`
  - `FRONTEND_URL`: Your Render app URL.
  - `EMAIL_USER`: Your Gmail address for sending OTPs.
  - `EMAIL_PASS`: Your Gmail App Password.





This project is licensed under the MIT License.
