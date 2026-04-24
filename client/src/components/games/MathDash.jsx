import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Timer, Trophy, ArrowLeft } from 'lucide-react';
import API_BASE from '../../config';

const MathDash = ({ user, onBack, socket, multiplayerData }) => {
    const [opponents, setOpponents] = useState({});
    const [teamScores, setTeamScores] = useState({ Red: 0, Blue: 0 });

    useEffect(() => {
        if (!socket) return;
        socket.on('opponentUpdate', (data) => {
            if (data.id !== socket?.id) {
                setOpponents(prev => ({ ...prev, [data.id]: data }));
            }
        });

        socket.on('scoreUpdate', (scores) => {
            setTeamScores(scores);
        });

        socket.on('gameOver', ({ winner }) => {
            setGameState('gameover');
        });

        return () => {
            socket.off('opponentUpdate');
            socket.off('scoreUpdate');
            socket.off('gameOver');
        };
    }, [socket]);

    const saveScore = async (finalScore) => {
        if (!user) return;
        try {
            await fetch(`${API_BASE}/api/update-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: user.name, score: finalScore })
            });
        } catch (e) { console.error(e); }
    };
    const [gameState, setGameState] = useState('start'); // start, playing, gameover
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const generateProblem = useCallback(() => {
        const operations = ['+', '-', '*'];
        const op = operations[Math.floor(Math.random() * (score > 10 ? 3 : 2))];

        let a, b, result;
        if (op === '+') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            result = a + b;
        } else if (op === '-') {
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * a);
            result = a - b;
        } else {
            a = Math.floor(Math.random() * 10) + 2;
            b = Math.floor(Math.random() * 10) + 2;
            result = a * b;
        }

        const options = [result];
        while (options.length < 4) {
            const wrong = result + (Math.floor(Math.random() * 10) - 5);
            if (!options.includes(wrong) && wrong >= 0) options.push(wrong);
        }

        setCurrentProblem({
            text: `${a} ${op === '*' ? '×' : op} ${b}`,
            options: options.sort(() => Math.random() - 0.5),
            correct: result
        });
    }, [score]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameState('playing');
        generateProblem();
    };

    const handleAnswer = (answer) => {
        if (answer === currentProblem.correct) {
            setScore(s => s + 100);
            setFeedback({ type: 'correct', text: '+100 SPEED BOOST!' });
            setTimeLeft(t => Math.min(30, t + 2));

            if (socket && multiplayerData?.roomId) {
                socket.emit('submitAnswer', {
                    roomId: multiplayerData.roomId,
                    isCorrect: true,
                    team: multiplayerData.team,
                    points: 10
                });
            }

            generateProblem();
        } else {
            setFeedback({ type: 'wrong', text: 'ENGINE STALL! -2s' });
            setTimeLeft(t => Math.max(0, t - 2));
        }
        setTimeout(() => setFeedback(null), 800);
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (socket && multiplayerData?.roomId) {
            socket.emit('playerUpdate', {
                id: socket.id,
                roomId: multiplayerData.roomId,
                name: user?.name || 'Player',
                score: score,
                team: multiplayerData.team
            });
        }
    }, [gameState, score, socket, multiplayerData]);

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft <= 0 && gameState === 'playing') {
            setGameState('gameover');
            if (score > highScore) setHighScore(score);
            saveScore(score);
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, score, highScore]);

    // Progress bar calculations
    const progressPercentage = Math.min(100, (score / 2000) * 100); // Max conceptual score for race line
    const fuelPercentage = (timeLeft / 30) * 100;

    return (
        <div className="relative min-h-screen bg-[#060012] text-white p-6 font-sans flex flex-col items-center justify-center overflow-hidden font-['Outfit',sans-serif]">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 w-[200vw] h-[200vh] -translate-x-1/2 -translate-y-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxeHB4IiAvPgo8L3N2Zz4=')] opacity-20 transform perspective-[1000px] rotateX-[60deg] scale-150 animate-[linear_pan_10s_infinite]"></div>
                <motion.div animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute right-1/4 top-0 w-[2px] h-full bg-cyan-400 blur-sm mix-blend-screen"></motion.div>
                <motion.div animate={{ scaleY: [1, 2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 }} className="absolute left-1/3 top-0 w-[4px] h-full bg-fuchsia-500 blur-md mix-blend-screen"></motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#060012_80%)]"></div>
            </div>

            {/* Back Button */}
            <button onClick={onBack} className="absolute top-8 left-8 z-50 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-md border border-white/10 transition-colors flex items-center gap-2">
                <ArrowLeft size={20} /> <span className="text-sm font-bold tracking-widest uppercase">Abort Mission</span>
            </button>

            {/* Team Progress HUD (Multiplayer) */}
            {multiplayerData && (
                <div className="fixed top-8 right-8 z-100 w-48 bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 text-center">SYNERGY LEVELS</div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] font-black mb-1.5">
                                <span className="text-fuchsia-500">RED SQUAD</span>
                                <span className="text-white">{teamScores.Red}</span>
                            </div>
                            <div className="h-1.5 bg-fuchsia-500/10 rounded-full overflow-hidden">
                                <motion.div animate={{ width: `${(teamScores.Red / 200) * 100}%` }} className="h-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-black mb-1.5">
                                <span className="text-cyan-400">BLUE SQUAD</span>
                                <span className="text-white">{teamScores.Blue}</span>
                            </div>
                            <div className="h-1.5 bg-cyan-400/10 rounded-full overflow-hidden">
                                <motion.div animate={{ width: `${(teamScores.Blue / 200) * 100}%` }} className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col h-full min-h-[600px] justify-center items-center">
                {gameState === 'start' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="text-center bg-black/40 backdrop-blur-2xl p-12 rounded-[40px] border border-white/10 shadow-[0_0_80px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-500/20 max-w-xl mx-auto">
                        <div className="w-28 h-28 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.6)] transform rotate-3">
                            <Zap size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                        </div>
                        <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-lg">MATH DASH</h1>
                        <p className="text-fuchsia-300 text-lg font-bold mb-10 flex items-center justify-center gap-3 uppercase tracking-widest flex-wrap">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            COMPUTE AT LIGHTSPEED
                            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(34,211,238,0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startGame}
                            className="w-full py-6 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-extrabold text-2xl rounded-2xl shadow-2xl transition-all uppercase tracking-[0.2em] border border-white/20 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-1/4 h-full bg-white/30 skew-x-[-20deg] group-hover:animate-[shine_1s_ease-in-out_infinite] -translate-x-[500%]"></div>
                            START ENGINE
                        </motion.button>
                        {highScore > 0 && (
                            <div className="mt-8 text-cyan-200/50 font-bold tracking-widest uppercase text-sm">
                                High Score: <span className="text-cyan-400">{highScore}</span>
                            </div>
                        )}
                    </motion.div>
                ) : gameState === 'playing' ? (
                    <div className="w-full flex-grow flex flex-col justify-between py-6">
                        
                        {/* Top Dashboard HUD */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 w-full px-4">
                            
                            {/* Score Display */}
                            <div className="bg-black/40 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] text-center min-w-[180px]">
                                <p className="text-xs font-black text-fuchsia-400/70 uppercase tracking-[0.3em] mb-1">SCORE</p>
                                <p className="text-4xl font-black text-white font-mono">{score.toString().padStart(5, '0')}</p>
                            </div>
                            
                            {/* Center Race Progress Bar */}
                            <div className="flex-grow max-w-md w-full relative">
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex justify-between">
                                    <span>START</span><span>FINISH</span>
                                </p>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                                    <motion.div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                    ></motion.div>
                                </div>
                                <motion.div 
                                    className="absolute bottom-[-10px] text-2xl shadow-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,1)]"
                                    animate={{ left: `calc(${progressPercentage}% - 14px)` }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                >
                                    🏎️
                                </motion.div>
                            </div>
                            
                            {/* Fuel Meter (Timer) */}
                            <div className={`bg-black/40 backdrop-blur-xl px-8 py-4 rounded-3xl border ${timeLeft <= 5 ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' : 'border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.1)]'} text-center min-w-[180px] flex items-center justify-center gap-4`}>
                                <div className="text-left">
                                    <p className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-1">FUEL</p>
                                    <p className={`text-4xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500' : 'text-cyan-400'}`}>
                                        {timeLeft}s
                                    </p>
                                </div>
                                <div className="w-4 h-12 bg-white/10 rounded-full flex items-end overflow-hidden">
                                     <motion.div 
                                        className={`w-full bg-cyan-400 ${timeLeft <= 5 ? 'bg-red-500' : ''}`}
                                        animate={{ height: `${fuelPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                    ></motion.div>
                                </div>
                            </div>

                        </div>

                        {/* Central Question Card */}
                        <div className="relative w-full max-w-2xl mx-auto my-auto perspectives-[1000px]">
                            <motion.div 
                                className="bg-white/5 backdrop-blur-3xl pt-16 pb-12 px-8 rounded-[48px] border border-fuchsia-500/30 shadow-[0_0_100px_rgba(168,85,247,0.15)] ring-1 ring-white/5 text-center relative z-20"
                                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <p className="absolute top-8 left-1/2 -translate-x-1/2 text-xs font-black tracking-[0.4em] text-fuchsia-300/60 uppercase">
                                    INCOMING TRANSMISSION
                                </p>
                                
                                <AnimatePresence mode="wait">
                                    <motion.div key={currentProblem?.text} initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }} className="mb-14">
                                        <h2 className="text-[100px] leading-[1] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-fuchsia-200 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                            {currentProblem?.text}
                                        </h2>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="grid grid-cols-2 gap-6 w-full max-w-lg mx-auto">
                                    {currentProblem?.options.map((opt, i) => (
                                        <motion.button 
                                            key={i} 
                                            whileHover={{ backgroundColor: '#22d3ee', color: '#000', scale: 1.05, boxShadow: "0 0 40px rgba(34,211,238,0.6)" }} 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleAnswer(opt)}
                                            className="group relative py-6 rounded-3xl bg-black/60 backdrop-blur-md text-4xl font-black text-fuchsia-200 border-2 border-fuchsia-500/40 hover:border-cyan-400 transition-all overflow-hidden"
                                        >
                                            <span className="relative z-10">{opt}</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/50 to-cyan-400/0 opacity-0 group-hover:opacity-100 group-hover:animate-[linear_pan_1s_infinite] w-[200%] -translate-x-1/2 pointer-events-none"></div>
                                        </motion.button>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 0, scale: 0.5 }} 
                                            animate={{ opacity: 1, y: -60, scale: 1.2 }} 
                                            exit={{ opacity: 0, filter: "blur(10px)" }}
                                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 text-3xl font-black tracking-widest whitespace-nowrap z-50 pointer-events-none drop-shadow-[0_0_20px_currentColor] ${feedback.type === 'correct' ? 'text-cyan-400' : 'text-red-500'}`}
                                        >
                                            <span className="bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full border border-current">{feedback.text}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-fuchsia-600/10 blur-[100px] z-0 pointer-events-none"></div>
                        </div>

                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} className="text-center w-full max-w-lg z-20">
                        <div className="bg-black/60 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/20 blur-[50px]"></div>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-32 h-32 absolute top-[-40px] right-[-40px] bg-fuchsia-500/20 blur-[60px] rounded-full"></motion.div>

                            <Trophy size={96} className="mx-auto mb-8 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]" />
                            <h2 className="text-5xl font-black mb-3 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">RACE COMPLETE</h2>
                            <p className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm mb-10">Neural metrics logged successfully</p>
                            
                            {/* Multiplayer Results */}
                            {multiplayerData && (
                                <div className="mb-10 p-6 bg-white/5 rounded-3xl border border-white/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-fuchsia-500 tracking-widest mb-1">RED TEAM</p>
                                            <p className="text-2xl font-black">{teamScores.Red}</p>
                                        </div>
                                        <div className="text-4xl">⚡</div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-cyan-400 tracking-widest mb-1">BLUE TEAM</p>
                                            <p className="text-2xl font-black">{teamScores.Blue}</p>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-white/50">
                                        {teamScores.Red > teamScores.Blue ? 'RED WINS' : teamScores.Blue > teamScores.Red ? 'BLUE WINS' : 'DRAW'}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center">
                                    <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest mb-2">FINAL SCORE</p>
                                    <p className="text-4xl font-black text-white font-mono">{score}</p>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center">
                                    <p className="text-[10px] font-black text-fuchsia-500/80 uppercase tracking-widest mb-2">HIGH SCORE</p>
                                    <p className="text-4xl font-black text-white font-mono">{highScore}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }} 
                                    whileTap={{ scale: 0.98 }}
                                    onClick={startGame} 
                                    className="w-full py-5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold text-xl rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all uppercase tracking-widest"
                                >
                                    RACE AGAIN
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }} 
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onBack} 
                                    className="w-full py-5 bg-transparent border-2 border-white/10 text-white font-bold text-lg rounded-2xl transition-colors uppercase tracking-widest"
                                >
                                    EXIT TO DASHBOARD
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            
            <style>{`
                @keyframes linear_pan {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 40px; }
                }
                @keyframes shine {
                    100% { transform: translateX(500%); }
                }
            `}</style>
        </div>
    );
};

export default MathDash;
