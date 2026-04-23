import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Home, Info, ChevronDown, User, LogOut, Zap, Trophy, Rocket, Brain } from 'lucide-react';

const Navbar = ({ user, onLogout, onSelectMode, setView }) => {
    const [isGamesOpen, setIsGamesOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const games = [
        { id: 'endless', name: 'Brain Race', icon: '🏎️' },
        { id: 'math', name: 'Math Dash', icon: '⚡' },
        { id: 'color', name: 'Color Reflex', icon: '🎨' },
        { id: 'word', name: 'Logic Flow', icon: '🧠' },
        { id: 'nature', name: 'Neural Recall', icon: '🧬' },
        { id: 'neon', name: 'Neon Nexus', icon: '🌌' },
        { id: 'multi', name: 'Multiplayer', icon: '👥' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] px-8 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                {/* Logo */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-12 transition-transform">
                        <Brain className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter italic">BRAIN<span className="text-cyan-400">RACE</span></span>
                </motion.div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => setView('dashboard')}
                        className="flex items-center gap-2 text-sm font-black text-white/60 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        <Home size={16} /> Home
                    </button>

                    {/* Games Dropdown */}
                    <div className="relative">
                        <button
                            onMouseEnter={() => setIsGamesOpen(true)}
                            onMouseLeave={() => setIsGamesOpen(false)}
                            className="flex items-center gap-2 text-sm font-black text-white/60 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            <Gamepad2 size={16} /> Games <ChevronDown size={14} className={`transition-transform duration-300 ${isGamesOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isGamesOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    onMouseEnter={() => setIsGamesOpen(true)}
                                    onMouseLeave={() => setIsGamesOpen(false)}
                                    className="absolute top-full -left-4 pt-4 w-64"
                                >
                                    <div className="bg-neutral-900 border border-white/10 rounded-3xl p-3 shadow-2xl overflow-hidden">
                                        <div className="grid grid-cols-1 gap-1">
                                            {games.map(game => (
                                                <button
                                                    key={game.id}
                                                    onClick={() => {
                                                        onSelectMode(game.id);
                                                        setIsGamesOpen(false);
                                                    }}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-colors text-left group"
                                                >
                                                    <span className="text-xl group-hover:scale-125 transition-transform">{game.icon}</span>
                                                    <span className="text-sm font-bold text-white/80 group-hover:text-white">{game.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 text-sm font-black text-white/60 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        <Info size={16} /> About
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{user?.name || 'Guest'}</span>
                        <div className="flex items-center gap-1">
                            <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold text-white/40">{user?.totalScore?.toLocaleString() || 0} XP</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center hover:border-cyan-500/50 transition-colors group"
                        >
                            <User className="text-white/80 group-hover:text-white" size={20} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-4 w-48"
                                >
                                    <div className="bg-neutral-900 border border-white/10 rounded-3xl p-2 shadow-2xl">
                                        <button
                                            onClick={onLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 text-rose-400 rounded-2xl transition-colors font-bold text-sm"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
