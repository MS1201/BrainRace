import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Trophy, ArrowLeft, RefreshCcw, Sparkles } from 'lucide-react';
import API_BASE from '../../config';

const MemoryMatrix = ({ user, onBack, socket }) => {
    const [gameState, setGameState] = useState('lobby'); // lobby, playing, flashing, finished
    const [gridSize, setGridSize] = useState(3);
    const [sequence, setSequence] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'
    const [canClick, setCanClick] = useState(false);

    const generateSequence = useCallback((size, count) => {
        const newSeq = [];
        while (newSeq.length < count) {
            const r = Math.floor(Math.random() * (size * size));
            if (!newSeq.includes(r)) newSeq.push(r);
        }
        return newSeq;
    }, []);

    const startLevel = useCallback(() => {
        const count = Math.min(level + 2, gridSize * gridSize - 1);
        const newSeq = generateSequence(gridSize, count);
        setSequence(newSeq);
        setUserInput([]);
        setCanClick(false);
        setGameState('flashing');

        setTimeout(() => {
            setCanClick(true);
            setGameState('playing');
        }, 1500 + (level * 200));
    }, [level, gridSize, generateSequence]);

    useEffect(() => {
        if (gameState === 'playing' && userInput.length === sequence.length) {
            const isCorrect = userInput.every((val, index) => sequence.includes(val));
            if (isCorrect) {
                setFeedback('correct');
                const points = level * 100;
                setScore(s => s + points);
                setTimeout(() => {
                    setFeedback(null);
                    if (level % 3 === 0 && gridSize < 6) {
                        setGridSize(g => g + 1);
                    }
                    setLevel(l => l + 1);
                    setGameState('success_wait');
                    setTimeout(() => {
                        setGameState('start_trigger');
                    }, 500);
                }, 1000);
            } else {
                setFeedback('wrong');
                setTimeout(() => setGameState('finished'), 1000);
            }
        }
    }, [userInput, sequence, gameState, level, gridSize]);

    // Save score to backend when game finishes
    useEffect(() => {
        if (gameState === 'finished' && score > 0 && user?.name) {
            const saveScore = async () => {
                try {
                    await fetch(`${API_BASE}/api/update-score`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerName: user.name, score: score })
                    });
                    console.log("Score saved successfully");
                } catch (err) {
                    console.error("Failed to save score:", err);
                }
            };
            saveScore();
        }
    }, [gameState, score, user?.name]);



    // Start level when trigger is set
    useEffect(() => {
        if (gameState === 'start_trigger') {
            startLevel();
        }
    }, [gameState, startLevel]); // Only run on trigger or callback change

    const handleTileClick = (index) => {
        if (!canClick || userInput.includes(index) || feedback) return;
        setUserInput([...userInput, index]);
        
        if (!sequence.includes(index)) {
            setFeedback('wrong');
            setTimeout(() => setGameState('finished'), 1000);
        }
    };

    const handleStart = () => {
        setScore(0);
        setLevel(1);
        setGridSize(3);
        setGameState('start_trigger');
    };

    if (gameState === 'lobby') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 font-['Outfit',sans-serif]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center p-12 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl relative z-10"
                >
                    <div className="w-24 h-24 bg-indigo-500 rounded-[30px] mx-auto mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] rotate-3">
                        <Brain size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">MATRIX RECALL</h1>
                    <p className="text-white/40 mb-10 font-bold uppercase tracking-[0.2em] text-[10px]">Train your focus. Expand your mind.</p>
                    
                    <button 
                        onClick={handleStart}
                        className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all uppercase tracking-widest"
                    >
                        Initialize Matrix
                    </button>
                    <button onClick={onBack} className="mt-8 text-white/20 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                        Exit Matrix
                    </button>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 font-['Outfit',sans-serif]">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-md w-full text-center p-12 rounded-[50px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
                >
                    <div className="w-20 h-20 bg-rose-500/20 border border-rose-500/30 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <Trophy size={40} className="text-rose-400" />
                    </div>
                    <h2 className="text-sm font-black text-white/30 uppercase tracking-[0.4em] mb-2">Recall Limit Reached</h2>
                    <div className="text-7xl font-black text-white mb-10 tracking-tighter tabular-nums">{score}</div>
                    
                    <button 
                        onClick={handleStart}
                        className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl mb-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        <RefreshCcw size={20} /> Try Again
                    </button>
                    <button 
                        onClick={onBack}
                        className="w-full py-5 bg-transparent border border-white/10 text-white/60 font-black text-lg rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest"
                    >
                        Save & Exit
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12 font-['Outfit',sans-serif] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-12 relative z-10">
                <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-8 bg-white/5 border border-white/10 px-10 py-4 rounded-full backdrop-blur-xl">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Level</span>
                        <span className="text-2xl font-black italic">{level}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sync Score</span>
                        <span className="text-2xl font-black tabular-nums">{score}</span>
                    </div>
                </div>

                <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/40 rounded-xl flex items-center justify-center">
                    <Zap size={20} className="text-indigo-400" />
                </div>
            </div>

            <div className="flex flex-col items-center justify-center relative z-10 py-10">
                <div className="mb-8 text-center h-8">
                    <AnimatePresence mode="wait">
                        {gameState === 'flashing' ? (
                            <motion.p key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-cyan-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Scanning Matrix Patterns...</motion.p>
                        ) : feedback === 'correct' ? (
                            <motion.p key="c" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-emerald-400 font-black uppercase tracking-[0.3em] text-sm flex items-center gap-2 italic">Protocol Sync Complete <Sparkles size={16}/></motion.p>
                        ) : feedback === 'wrong' ? (
                            <motion.p key="w" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-rose-500 font-black uppercase tracking-[0.3em] text-sm italic">Pattern Mismatch</motion.p>
                        ) : (
                            <motion.p key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 font-black uppercase tracking-[0.3em] text-sm">Tap the highlighted sequence</motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div 
                    className="grid gap-3 p-4 bg-white/5 border border-white/10 rounded-[40px] shadow-2xl backdrop-blur-md"
                    style={{ 
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        width: 'min(90vw, 500px)',
                        aspectRatio: '1/1'
                    }}
                >
                    {[...Array(gridSize * gridSize)].map((_, i) => (
                        <motion.button
                            key={i}
                            whileTap={canClick ? { scale: 0.9 } : {}}
                            onClick={() => handleTileClick(i)}
                            className={`rounded-2xl transition-all duration-300 relative overflow-hidden ${
                                gameState === 'flashing' && sequence.includes(i)
                                    ? 'bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.8)]'
                                    : userInput.includes(i) && sequence.includes(i)
                                        ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                                        : userInput.includes(i) && !sequence.includes(i)
                                            ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                                            : feedback === 'correct'
                                                ? 'bg-emerald-500/20 opacity-50'
                                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemoryMatrix;
