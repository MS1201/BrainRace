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

## 🔑 Admin Credentials
- **Email**: `mukulsharma22@gnu.ac.in`
- **Password**: `Admin@1234`

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd BrainRace
   ```

2. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm start
   ```

3. **Backend Setup**:
   ```bash
   cd ../server
   npm install
   npm start
   ```

## 📝 License

This project is licensed under the MIT License.
