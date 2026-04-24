import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trophy, Zap, Clock, ArrowLeft } from 'lucide-react';
import API_BASE from '../../config';

// Geometric shapes for tiles
const SHAPES = ['triangle', 'hexagon', 'circle', 'diamond'];
const COLORS = ['cyan', 'magenta', 'purple', 'yellow'];

const generateGrid = (size = 8) => {
    return Array(size * size).fill(null).map((_, i) => ({
        id: i,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        active: false,
    }));
};

const NeonNexus = ({ user, onBack, playerInfo }) => {
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
    const [grid, setGrid] = useState([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60);
    const [combo, setCombo] = useState(0);

    const initGame = () => {
        setGrid(generateGrid(8));
        setScore(0);
        setLives(3);
        setTimeLeft(60);
        setCombo(0);
        setGameState('playing');
    };

    // Randomly activate tiles
    useEffect(() => {
        if (gameState !== 'playing') return;
        
        const spawnRate = Math.max(250, 1000 - (score * 0.8)); // Initial 1000ms, cap at 250ms (Lightning fast)
        
        const interval = setInterval(() => {
            setGrid(prev => {
                const newGrid = [...prev];
                const inactiveIdxs = newGrid.map((t, i) => !t.active ? i : -1).filter(i => i !== -1);
                if (inactiveIdxs.length > 0) {
                    const rndIdx = inactiveIdxs[Math.floor(Math.random() * inactiveIdxs.length)];
                    newGrid[rndIdx] = { ...newGrid[rndIdx], active: true, spawnTime: Date.now() };
                }
                return newGrid;
            });
        }, spawnRate);

        return () => clearInterval(interval);
    }, [gameState, score]);

    // Deactivate missed tiles and lose lives
    useEffect(() => {
        if (gameState !== 'playing') return;

        const checkMissed = setInterval(() => {
            const now = Date.now();
            let lostLife = false;
            setGrid(prev => {
                let changed = false;
                const next = prev.map(tile => {
                    if (tile.active && now - tile.spawnTime > 1800) { // 1.8 seconds to click (Much faster)
                        changed = true;
                        lostLife = true;
                        return { ...tile, active: false };
                    }
                    return tile;
                });
                return changed ? next : prev;
            });

            if (lostLife) {
                setCombo(0);
                setLives(l => {
                    if (l <= 1) { setGameState('gameover'); saveScore(score); }
                    return l - 1;
                });
            }
        }, 500);

        return () => clearInterval(checkMissed);
    }, [gameState]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('gameover');
                    saveScore(score);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    const handleTileClick = (index) => {
        if (gameState !== 'playing' || !grid[index].active) return;

        setGrid(prev => {
            const next = [...prev];
            // Randomize shape/color on click to keep board fresh
            next[index] = { 
                ...next[index], 
                active: false, 
                shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            };
            return next;
        });

        setCombo(c => c + 1);
        setScore(s => s + 50 + (combo * 10));
    };

    const renderShape = (shape, active, color) => {
        const colorClasses = {
            cyan: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]",
            magenta: "text-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]",
            purple: "text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]",
            yellow: "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
        };
        const cl = active ? colorClasses[color] : "text-white/5";

        switch (shape) {
            case 'triangle':
                return <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3/5 h-3/5 transition-all duration-300 ${cl}`}><path d="M12 2L22 20H2L12 2Z"/></svg>;
            case 'hexagon':
                return <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3/5 h-3/5 transition-all duration-300 ${cl}`}><path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"/></svg>;
            case 'circle':
                return <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3/5 h-3/5 transition-all duration-300 ${cl}`}><circle cx="12" cy="12" r="10"/></svg>;
            case 'diamond':
                return <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3/5 h-3/5 transition-all duration-300 ${cl}`}><path d="M12 2L22 12L12 22L2 12L12 2Z"/></svg>;
            default: return null;
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0a0514] text-white flex flex-col items-center justify-center overflow-hidden font-['Space_Grotesk',sans-serif]">
            {/* Dark synthwave grid background with scanlines */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Floor Grid */}
                <div className="absolute bottom-0 left-0 w-full h-[60%] bg-[linear-gradient(transparent_0%,rgba(217,70,239,0.2)_100%)]">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik02MCAwaC02MHY2MGg2MHYtNjB6bS0xIDU5aC01OHYtNThoNTh2NTh6IiBmaWxsPSIjZjk1ZmU2IiBmaWxsLW9wYWNpdHk9IjAuMTUiLz4KPC9zdmc+')] transform perspective-[600px] rotateX-[75deg] scale-[2] origin-bottom animate-[linear_pan_5s_infinite]"></div>
                </div>
                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[150px] mix-blend-screen"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/20 rounded-full blur-[150px] mix-blend-screen"></div>
                
                {/* CRT Scanline overlay effect */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] z-50 pointer-events-none"></div>
            </div>

            <button onClick={onBack} className="absolute top-6 left-6 z-50 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-md border border-white/10 transition-colors flex items-center gap-2">
                <ArrowLeft size={18} /> <span className="text-xs font-black tracking-widest uppercase text-cyan-400">EXIT NEXUS</span>
            </button>

            <div className="relative z-10 w-full max-w-[800px] mx-auto p-4 flex flex-col items-center h-full">
                
                {gameState === 'start' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-20 bg-black/60 backdrop-blur-xl p-12 rounded-3xl border border-fuchsia-500/30 shadow-[0_0_80px_rgba(217,70,239,0.2)]">
                        <h1 className="text-7xl font-black mb-2 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                            NEON NEXUS
                        </h1>
                        <p className="text-cyan-300 font-bold tracking-[0.3em] uppercase mb-10 text-sm">Synchronize your neural patterns</p>
                        
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(217,70,239,0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={initGame}
                            className="bg-fuchsia-600 border-2 border-fuchsia-400 text-white px-12 py-5 rounded-xl font-black text-2xl uppercase tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all"
                        >
                            INITIATE LINK
                        </motion.button>
                    </motion.div>
                ) : gameState === 'playing' ? (
                    <div className="w-full flex flex-col items-center">
                        
                        {/* Top Dashboard HUD */}
                        <div className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-8 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                            {/* Score Display (Digital Font effect) */}
                            <div className="font-mono text-3xl font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                                <span className="text-xs text-white/50 block font-sans tracking-[0.2em] mb-1">SCORE</span>
                                {score.toString().padStart(6, '0')}
                            </div>

                            {/* Timer Bar */}
                            <div className="flex-grow max-w-[300px] mx-6">
                                <div className="flex justify-between text-[10px] font-black tracking-widest text-fuchsia-400 mb-2">
                                    <span>SYSTEM TIME</span>
                                    <span>{timeLeft}s</span>
                                </div>
                                <div className="h-3 bg-black rounded-full border border-fuchsia-500/30 overflow-hidden relative">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 box-shadow-[0_0_10px_rgba(217,70,239,1)]"
                                        animate={{ width: `${(timeLeft / 60) * 100}%` }}
                                        transition={{ ease: "linear", duration: 1 }}
                                    ></motion.div>
                                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-white/50 animate-pulse mix-blend-overlay"></div>
                                </div>
                            </div>

                            {/* Lives */}
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <Heart 
                                        key={i} 
                                        className={`w-8 h-8 transition-all duration-300 ${i < lives ? 'fill-fuchsia-500 text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]' : 'fill-transparent text-white/10'}`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Combo Indicator */}
                        <AnimatePresence>
                            {combo > 2 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.5 }}
                                    className="absolute top-36 right-10 text-yellow-400 font-black text-3xl italic tracking-tighter drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] rotate-12 z-20 pointer-events-none"
                                >
                                    {combo}X COMBO!
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 8x8 Matching Grid */}
                        <div className="grid grid-cols-8 gap-2 xs:gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            {grid.map((tile, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={tile.active ? { scale: 1.1, zIndex: 10 } : {}}
                                    whileTap={tile.active ? { scale: 0.9 } : {}}
                                    onClick={() => handleTileClick(i)}
                                    className={`
                                        w-10 h-10 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden
                                        ${tile.active 
                                            ? 'bg-white/10 border-2 border-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]' 
                                            : 'bg-black/40 border border-white/5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]'}
                                    `}
                                    style={{
                                        boxShadow: tile.active ? `0 10px 20px rgba(0,0,0,0.3), 0 0 15px currentColor` : 'none',
                                        color: tile.active ? (tile.color === 'cyan' ? '#22d3ee' : tile.color === 'magenta' ? '#d946ef' : tile.color === 'purple' ? '#a855f7' : '#facc15') : 'transparent'
                                    }}
                                >
                                    {/* 3D Inner Top Glass Highlight */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                                    
                                    <AnimatePresence>
                                        {tile.active && (
                                            <motion.div 
                                                initial={{ scale: 0, rotate: -90 }} 
                                                animate={{ scale: 1, rotate: 0 }} 
                                                exit={{ scale: 0 }}
                                                className="w-full h-full flex items-center justify-center"
                                            >
                                                {renderShape(tile.shape, tile.active, tile.color)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Inner pulse ring for active tiles */}
                                    {tile.active && (
                                        <motion.div
                                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="absolute inset-0 rounded-xl border-2 border-current pointer-events-none"
                                        ></motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="text-center mt-20 bg-black/80 backdrop-blur-2xl p-12 rounded-3xl border border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.2)]">
                        <Trophy size={80} className="mx-auto mb-6 text-fuchsia-500 drop-shadow-[0_0_20px_rgba(217,70,239,0.8)]" />
                        <h2 className="text-5xl font-black mb-2 tracking-tighter uppercase text-white">SYSTEM <span className="text-fuchsia-500">OFFLINE</span></h2>
                        <p className="text-cyan-300 font-bold tracking-[0.2em] uppercase mb-8 text-sm">Neural Link Severed</p>
                        
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 inline-block min-w-[250px]">
                            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">FINAL SCORE</p>
                            <p className="text-5xl font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{score}</p>
                        </div>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,211,238,0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={initGame}
                                className="bg-cyan-500 text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all"
                            >
                                RECONNECT
                            </motion.button>
                            <button onClick={onBack} className="py-4 text-white/50 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors">
                                Return to Hub
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <style>{`
                @keyframes linear_pan {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 60px; }
                }
            `}</style>
        </div>
    );
};

export default NeonNexus;
