import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Check, X, Palette, ArrowLeft } from 'lucide-react';
import API_BASE from '../../config';

const ColorMatch = ({ user, onBack }) => {
    const saveScore = async (finalScore) => {
        if (!user) return;
        try {
            await fetch(`${API_BASE}/api/update-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: user.name, score: finalScore })
            });
        } catch(e) { console.error(e); }
    };
    const [gameState, setGameState] = useState('start'); // start, playing, gameover
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(25);
    const [currentPair, setCurrentPair] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const colors = [
        { name: 'Red', hex: '#FF6B6B' },
        { name: 'Blue', hex: '#4ECDC4' },
        { name: 'Green', hex: '#45E994' },
        { name: 'Yellow', hex: '#FFE66D' },
        { name: 'Purple', hex: '#A855F7' },
        { name: 'Pink', hex: '#EC4899' },
        { name: 'Cyan', hex: '#00D4FF' }
    ];

    const generatePair = useCallback(() => {
        const nameIdx = Math.floor(Math.random() * colors.length);
        const colorIdx = Math.random() < 0.5 ? nameIdx : Math.floor(Math.random() * colors.length);

        setCurrentPair({
            name: colors[nameIdx].name,
            color: colors[colorIdx].hex,
            isMatch: nameIdx === colorIdx
        });
    }, []);

    const startGame = () => {
        setScore(0);
        setTimeLeft(25);
        setGameState('playing');
        generatePair();
    };

    const handleDecision = (userSaysMatch) => {
        if (gameState !== 'playing') return;
        if (userSaysMatch === currentPair.isMatch) {
            setScore(s => s + 150);
            setFeedback({ type: 'correct', icon: <Check size={80} /> });
            setTimeLeft(t => Math.min(25, t + 1));
        } else {
            setFeedback({ type: 'wrong', icon: <X size={80} /> });
            setTimeLeft(t => Math.max(0, t - 3));
        }
        generatePair();
        setTimeout(() => setFeedback(null), 300);
    };

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft <= 0 && gameState === 'playing') {
            setGameState('gameover');
            saveScore(score);
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    return (
        <div className="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center p-6 overflow-hidden font-['Space_Grotesk',sans-serif]">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <button onClick={onBack} className="absolute top-8 left-8 z-50 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="w-full max-w-lg relative z-10">
                {gameState === 'start' ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-[32px] mx-auto mb-10 flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-xl">
                            <Palette size={48} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>
                        <h1 className="text-6xl font-black text-white mb-6 tracking-tighter uppercase italic">
                            COLOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">MATCH</span>
                        </h1>
                        <p className="text-white/40 font-bold mb-12 uppercase tracking-[0.3em] text-xs">Does the word synchronize with the visual?</p>

                        <div className="grid grid-cols-2 gap-4 mb-12">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                                <h4 className="font-bold text-white/30 text-[10px] mb-2 tracking-widest uppercase text-left">TRAINING ZONE</h4>
                                <p className="font-black text-white text-lg text-left">Inhibition</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                                <h4 className="font-bold text-white/30 text-[10px] mb-2 tracking-widest uppercase text-left">BOOST LEVEL</h4>
                                <p className="font-black text-white text-lg text-left">Reaction</p>
                            </div>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139,92,246,0.4)" }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={startGame}
                            className="group relative w-full py-6 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-[24px] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl overflow-hidden"
                        >
                            <span className="relative z-10">INITIALIZE MATCH</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        </motion.button>
                        <button onClick={onBack} className="mt-8 font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest text-xs">Return to Station</button>
                    </motion.div>
                ) : gameState === 'playing' ? (
                    <div className="space-y-10">
                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl">
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">CURRENT SCORE</p>
                                <p className="text-4xl font-black text-white tracking-tighter tabular-nums text-glow">{score}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">STABILITY</p>
                                <div className="flex items-center gap-3">
                                    <Timer size={24} className={timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'} />
                                    <span className={`text-4xl font-black tabular-nums tracking-tighter ${timeLeft <= 5 ? 'text-rose-500' : 'text-white'}`}>{timeLeft}s</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] bg-white/5 rounded-[56px] border-2 border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden group">
                            {/* Inner Glows */}
                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px]"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-600/20 rounded-full blur-[80px]"></div>
                            
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentPair?.name + currentPair?.color} 
                                    initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }} 
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                                    exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                                    transition={{ type: "spring", damping: 15 }}
                                >
                                    <h2 className="text-8xl font-black uppercase tracking-tighter text-glow-strong" style={{ color: currentPair?.color }}>
                                        {currentPair?.name}
                                    </h2>
                                </motion.div>
                            </AnimatePresence>

                            <AnimatePresence>
                                {feedback && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5 }} 
                                        animate={{ opacity: 1, scale: 1.2 }} 
                                        exit={{ opacity: 0, scale: 2 }}
                                        className={`absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm ${feedback.type === 'correct' ? 'text-emerald-400' : 'text-rose-500'}`}
                                    >
                                        <div className="bg-black/50 p-10 rounded-full border border-current shadow-[0_0_50px_currentColor]">
                                            {feedback.icon}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pb-12">
                            <motion.button 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }} 
                                onClick={() => handleDecision(false)}
                                className="group py-8 bg-rose-600/10 border-2 border-rose-500/50 text-rose-500 font-black text-4xl rounded-[40px] shadow-[0_10px_40px_rgba(244,63,94,0.2)] hover:bg-rose-600 hover:text-white transition-all overflow-hidden relative"
                            >
                                <span className="relative z-10">NO</span>
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }} 
                                onClick={() => handleDecision(true)}
                                className="group py-8 bg-emerald-600/10 border-2 border-emerald-500/50 text-emerald-400 font-black text-4xl rounded-[40px] shadow-[0_10px_40px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:text-white transition-all overflow-hidden relative"
                            >
                                <span className="relative z-10">YES</span>
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 p-12 rounded-[56px] border border-white/10 backdrop-blur-2xl text-center shadow-2xl">
                        <Trophy size={80} className="mx-auto mb-8 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                        <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter italic">SYNC SEVERED</h2>
                        <p className="text-white/40 font-bold mb-10 text-xl tracking-wide uppercase">Final performance: <span className="text-cyan-400">{score}</span></p>
                        
                        <div className="space-y-4">
                            <motion.button 
                                whileHover={{ scale: 1.03 }} 
                                whileTap={{ scale: 0.97 }} 
                                onClick={startGame} 
                                className="w-full py-6 bg-white text-black font-black text-2xl rounded-[24px] shadow-xl hover:bg-cyan-400 transition-all uppercase tracking-widest"
                            >
                                RE-STABILIZE
                            </motion.button>
                            <button onClick={onBack} className="w-full py-6 bg-white/5 text-white/30 font-black text-xl rounded-[24px] hover:bg-white/10 transition-all uppercase tracking-widest border border-white/5">
                                TERMINATE
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ColorMatch;
