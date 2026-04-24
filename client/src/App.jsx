import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AuthPages from './components/AuthPages.jsx';
import DashboardNew from './components/DashboardNew.jsx';
import Navbar from './components/Navbar.jsx';
import Lobby from './components/Lobby.jsx';
import GameDetailPage from './components/GameDetailPage.jsx';
import EndlessRunner from './components/games/EndlessRunner.jsx';
import NeonNexus from './components/games/NeonNexus.jsx';
import MathDash from './components/games/MathDash.jsx';
import MemoryMatrix from './components/games/MemoryMatrix.jsx';
import LogicFlow from './components/games/LogicFlow.jsx';
import ColorMatch from './components/games/ColorMatch.jsx';
import BrainBuddy from './components/games/BrainBuddy.jsx';
import MathDrops from './components/games/MathDrops.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import LandingPage from './components/LandingPage.jsx';
import API_BASE from './config';

const SOCKET_URL = API_BASE;

function App() {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('brainrace_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            localStorage.removeItem('brainrace_user');
            return null;
        }
    });

    const [view, setView] = useState(() => {
        const saved = localStorage.getItem('brainrace_user');
        if (saved) {
            return 'teacherDashboard';
        }
        return 'landing';
    });
    const [gameMode, setGameMode] = useState(null);
    const [multiplayerData, setMultiplayerData] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io(SOCKET_URL, { transports: ['websocket'] });
        setSocket(s);
        return () => s.disconnect();
    }, []);

    const handleAuth = (userData) => {
        setUser(userData);
        localStorage.setItem('brainrace_user', JSON.stringify(userData));
        setView('teacherDashboard');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('brainrace_user');
        setView('auth');
        setGameMode(null);
    };

    // Clicking a game card -> show detail page
    const handleSelectMode = (mode) => {
        setGameMode(mode);
        if (mode === 'multi') {
            setView('lobby');
        } else {
            setView('gameDetail');
        }
    };

    // "Play Now" button on detail page -> start the game
    const handlePlayGame = () => {
        setView('game');
    };

    const handleMultiplayerJoin = (data) => {
        setMultiplayerData(data);
        setView('game');
    };

    const handleBackToDashboard = () => {
        // Refresh user from server to get updated score
        if (user && user.role !== 'teacher') {
            fetch(`${API_BASE}/api/user/${encodeURIComponent(user.name)}`)
                .then(r => r.json())
                .then(updated => {
                    if (updated && updated.name) {
                        const merged = { ...user, ...updated };
                        setUser(merged);
                        localStorage.setItem('brainrace_user', JSON.stringify(merged));
                    }
                })
                .catch(() => {});
        }
        setView(user?.role === 'teacher' ? 'teacherDashboard' : 'dashboard');
        setGameMode(null);
        setMultiplayerData(null);
    };

    const handleBackToDetail = () => {
        setView('gameDetail');
    };

    if (!user && view === 'landing') {
        return <LandingPage onGetStarted={() => setView('auth')} />;
    }

    if (!user && view === 'auth') {
        return (
            <div>
                <button 
                    onClick={() => setView('landing')}
                    style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 100, color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
                >
                    ← Back
                </button>
                <AuthPages onAuth={handleAuth} />
            </div>
        );
    }

    const renderGame = () => {
        const commonProps = {
            user,
            onBack: handleBackToDashboard,
            socket,
            multiplayerData,
        };

        const targetMode = gameMode === 'multi' ? (multiplayerData?.gameType || 'endless') : gameMode;

        switch (targetMode) {
            case 'endless': return <EndlessRunner {...commonProps} />;
            case 'neon':    return <NeonNexus {...commonProps} />;
            case 'math':    return <MathDash {...commonProps} />;
            case 'word':    return <LogicFlow {...commonProps} />;
            case 'nature':  return <MemoryMatrix {...commonProps} />;
            case 'color':   return <ColorMatch {...commonProps} />;
            case 'buddy':   return <BrainBuddy {...commonProps} />;
            case 'mathdrops': return <MathDrops {...commonProps} />;
            default:        return <DashboardNew user={user} onSelectMode={handleSelectMode} />;
        }
    };

    return (
        <div style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif" }}>
            {view !== 'game' && (
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    onSelectMode={handleSelectMode}
                    setView={setView}
                />
            )}

            {view === 'dashboard' && (
                <DashboardNew user={user} onSelectMode={handleSelectMode} />
            )}

            {view === 'teacherDashboard' && (
                <TeacherDashboard user={user} onBack={() => setView('dashboard')} />
            )}

            {view === 'gameDetail' && gameMode && (
                <GameDetailPage
                    gameMode={gameMode}
                    onPlay={handlePlayGame}
                    onBack={handleBackToDashboard}
                />
            )}

            {view === 'lobby' && (
                <Lobby
                    onJoin={handleMultiplayerJoin}
                    socket={socket}
                    user={user}
                />
            )}

            {view === 'game' && renderGame()}
        </div>
    );
}

export default App;
