import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, ArrowRight, Play, Swords } from 'lucide-react';

const Lobby = ({ onJoin, socket, user }) => {
    const [phase, setPhase] = useState('find'); // find, waiting
    const [playerName, setPlayerName] = useState(user?.name || '');
    const [roomId, setRoomId] = useState('');
    const [team, setTeam] = useState('Red');
    const [roomData, setRoomData] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('roomUpdate', (data) => {
            setRoomData(data);
            setPhase('waiting');
        });

        socket.on('multiplayerStart', () => {
            onJoin({ playerName, roomId, team });
        });

        return () => {
            socket.off('roomUpdate');
            socket.off('multiplayerStart');
        };
    }, [socket, onJoin, playerName, roomId, team]);

    const handleJoinRequest = (e) => {
        e.preventDefault();
        if (!playerName || !roomId) return;
        socket.emit('joinRoom', { playerName, roomId, team });
    };

    const handleStartGame = () => {
        socket.emit('startGame', { roomId });
    };

    if (phase === 'waiting' && roomData) {
        const redTeam = roomData.players.filter(p => p.team === 'Red');
        const blueTeam = roomData.players.filter(p => p.team === 'Blue');

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Team Selection / Lobby Info */}
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                        <div className="mb-10">
                            <span className="px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-xs font-black uppercase tracking-widest">Room ID: {roomId}</span>
                            <h2 className="text-4xl font-black text-gray-900 mt-4 leading-tight">Ready for Battle?</h2>
                            <p className="text-gray-500 font-medium mt-2">Wait for all racers to join or launch the race now.</p>
                        </div>

                        <div className="space-y-4 mb-10">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Racing Teams</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-red-50 border border-red-100 flex flex-col items-center">
                                    <div className="text-3xl mb-2">🔴</div>
                                    <span className="text-2xl font-black text-red-600">{redTeam.length}</span>
                                    <span className="text-[10px] font-bold text-red-400 uppercase">Red Racers</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col items-center">
                                    <div className="text-3xl mb-2">🔵</div>
                                    <span className="text-2xl font-black text-blue-600">{blueTeam.length}</span>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase">Blue Racers</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartGame}
                            disabled={roomData.players.length < 1}
                            className="group w-full py-6 bg-gray-900 text-white rounded-3xl font-black text-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                        >
                            LAUNCH RACE <Play className="fill-white group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Active Players List */}
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 overflow-hidden">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Users size={16} /> Entrants Log ({roomData.players.length})
                        </h3>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {roomData.players.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                                                {p.team === 'Red' ? '🏎️' : '🚙'}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-gray-900">{p.playerName}</div>
                                                <div className={`text-[10px] font-black uppercase ${p.team === 'Red' ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {p.team} TEAM
                                                </div>
                                            </div>
                                        </div>
                                        {p.playerName === playerName && (
                                            <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-1 rounded-md">YOU</span>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex p-4 bg-gray-900 rounded-[24px] mb-8 shadow-2xl rotate-3">
                        <Swords className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">MULTIPLAYER</h1>
                    <p className="text-gray-500 font-medium">Join a competitive racing chamber.</p>
                </div>

                <form onSubmit={handleJoinRequest} className="bg-white p-10 rounded-[48px] shadow-2xl shadow-indigo-200/20 border border-gray-100 space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Profile Identifier</label>
                        <input
                            type="text"
                            required
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                            className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-gray-900 rounded-3xl transition-all font-bold outline-none"
                            placeholder="Enter nickname..."
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Chamber Code</label>
                        <input
                            type="text"
                            required
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-gray-900 rounded-3xl transition-all font-bold outline-none uppercase"
                            placeholder="e.g. SKY-RACER"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setTeam('Red')}
                            className={`py-5 rounded-3xl font-black text-sm border-2 transition-all ${team === 'Red' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}
                        >
                            RED TEAM
                        </button>
                        <button
                            type="button"
                            onClick={() => setTeam('Blue')}
                            className={`py-5 rounded-3xl font-black text-sm border-2 transition-all ${team === 'Blue' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}
                        >
                            BLUE TEAM
                        </button>
                    </div>

                    <button className="w-full py-6 bg-gray-900 text-white rounded-3xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        INITIALIZE CONNECTION <ArrowRight size={20} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Lobby;
