import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuestions } from '../../services/questionService';
import { Zap, Fuel, Trophy, ArrowLeft, ArrowRight, ChevronLeft, Gauge, AlertTriangle } from 'lucide-react';

const FUEL_WARNING_THRESHOLD = 25; 

const EndlessRunner = ({ user, onBack, socket, multiplayerData }) => {
    const [gameState, setGameState] = useState('playing');
    const [score, setScore] = useState(0);
    const [carLane, setCarLane] = useState(1); 
    const [obstacles, setObstacles] = useState([]);
    const [fuel, setFuel] = useState(100);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [usedQuestions, setUsedQuestions] = useState(new Set());
    const [fuelWarningShown, setFuelWarningShown] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState(null); 
    const [opponents, setOpponents] = useState({});
    const scoreRef = useRef(0);

    useEffect(() => { scoreRef.current = score; }, [score]);

    useEffect(() => {
        const loadQuestions = async () => {
            const data = await fetchQuestions(30);
            setQuestions(data);
        };
        loadQuestions();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('opponentUpdate', (data) => {
            if (data.id !== socket?.id) {
                setOpponents(prev => ({ ...prev, [data.id]: data }));
            }
        });
        return () => socket.off('opponentUpdate');
    }, [socket]);

    const getNextQuestion = () => {
        const available = questions.filter((_, i) => !usedQuestions.has(i));
        if (available.length === 0) {
            setUsedQuestions(new Set());
            return questions[Math.floor(Math.random() * questions.length)];
        }
        const idx = Math.floor(Math.random() * available.length);
        const actualIdx = questions.indexOf(available[idx]);
        setUsedQuestions(prev => new Set([...prev, actualIdx]));
        return available[idx];
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setFuel(f => {
                const newFuel = Math.max(0, f - 0.35);

                if (newFuel <= FUEL_WARNING_THRESHOLD && !fuelWarningShown && questions.length > 0) {
                    setFuelWarningShown(true);
                    const q = getNextQuestion();
                    if (q) {
                        setCurrentQuestion(q);
                        setGameState('fuel_warning');
                    }
                }

                if (newFuel <= 0) {
                    setGameState('gameover');
                    saveScore(scoreRef.current);
                }
                return newFuel;
            });

            setScore(s => s + 5);

            if (socket) {
                socket.emit('playerUpdate', {
                    id: socket.id,
                    roomId: multiplayerData?.roomId,
                    name: user?.name || 'Player',
                    lane: carLane,
                    score: scoreRef.current,
                });
            }

            // Move obstacles
            setObstacles(prev => {
                let newObstacles = prev.map(o => ({ ...o, y: o.y + o.speed }))
                    .filter(o => o.y < 110);

                // Collision detection
                const hit = newObstacles.find(o => o.lane === carLane && o.y > 75 && o.y < 90 && !o.hit);
                if (hit) {
                    hit.hit = true;
                    if (hit.type === 'coin') {
                        setScore(s => s + 500);
                    } else if (hit.type === 'fuel_can') {
                        setFuel(f => Math.min(100, f + 30));
                    } else if (hit.type === 'enemy') {
                        setFuel(f => Math.max(0, f - 20));
                    }
                }

                // Spawn logic
                if (Math.random() < 0.07) {
                    const lane = Math.floor(Math.random() * 3);
                    const typeRoll = Math.random();
                    let type = 'coin';
                    if (typeRoll < 0.12) type = 'fuel_can';
                    else if (typeRoll < 0.38) type = 'enemy';

                    newObstacles.push({
                        id: Math.random(),
                        lane,
                        y: -10,
                        type,
                        speed: 3 + Math.random() * 2,
                        hit: false
                    });
                }

                return newObstacles;
            });

        }, 50);
        return () => clearInterval(interval);
    }, [gameState, carLane, fuelWarningShown, questions, socket]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            if (e.key === 'ArrowLeft') setCarLane(l => Math.max(0, l - 1));
            if (e.key === 'ArrowRight') setCarLane(l => Math.min(2, l + 1));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const saveScore = async (finalScore) => {
        try {
            await fetch('http://localhost:3001/api/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: user?.name, score: finalScore })
            });
        } catch (e) { console.error(e); }
    };

    const handleFuelAnswer = (option) => {
        const isCorrect = option === currentQuestion.correct;
        if (isCorrect) {
            setAnswerFeedback('correct');
            setTimeout(() => {
                setFuel(100); // Refuel completely on correct answer
                setScore(s => s + 1000);
                setFuelWarningShown(false); // Allow another warning later
                setCurrentQuestion(null);
                setAnswerFeedback(null);
                setGameState('playing');
            }, 1200);
        } else {
            setAnswerFeedback('wrong');
            setTimeout(() => {
                // Wrong answer = game over
                setAnswerFeedback(null);
                setCurrentQuestion(null);
                setGameState('gameover');
                saveScore(scoreRef.current);
            }, 1500);
        }
    };

    const restartGame = () => {
        setScore(0);
        setFuel(100);
        setObstacles([]);
        setFuelWarningShown(false);
        setCurrentQuestion(null);
        setOpponents({});
        setGameState('playing');
    };

    const fuelColor = fuel > 50 ? '#22d3ee' : fuel > FUEL_WARNING_THRESHOLD ? '#f59e0b' : '#ef4444';

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: '#050510', padding: '16px',
            fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
            overflow: 'hidden', position: 'relative'
        }}>
            {/* Background Grid */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }} />

            <button onClick={onBack} style={{
                position: 'absolute', top: '24px', left: '24px', zIndex: 50,
                padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', backdropFilter: 'blur(10px)'
            }}>
                <ChevronLeft size={18} /> Back
            </button>

            {/* Game Canvas */}
            <div style={{
                width: '100%', maxWidth: '400px', height: '680px',
                background: '#0a0a20', position: 'relative', overflow: 'hidden',
                borderRadius: '40px',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 8px rgba(255,255,255,0.04)',
                border: '4px solid rgba(255,255,255,0.06)'
            }}>
                {/* Road */}
                <div style={{ position: 'absolute', inset: 0, background: '#0c0c2a' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'repeating-linear-gradient(transparent, transparent 40px, rgba(255,255,255,0.025) 40px, rgba(255,255,255,0.025) 80px)',
                        animation: 'moveRoad 0.5s linear infinite'
                    }} />
                    <div style={{ position: 'absolute', inset: '0', left: '33.33%', width: '2px', background: 'rgba(34,211,238,0.2)' }} />
                    <div style={{ position: 'absolute', inset: '0', left: '66.66%', width: '2px', background: 'rgba(34,211,238,0.2)' }} />
                </div>

                {/* HUD */}
                <div style={{
                    position: 'absolute', top: '16px', left: '16px', right: '16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 30
                }}>
                    {/* Fuel */}
                    <div style={{
                        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
                        padding: '12px 16px', borderRadius: '20px',
                        border: `1px solid ${fuel <= FUEL_WARNING_THRESHOLD ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: fuel <= FUEL_WARNING_THRESHOLD ? '0 0 15px rgba(239,68,68,0.2)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <Gauge size={12} color={fuelColor} />
                            <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' }}>Fuel</span>
                        </div>
                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${fuel}%`,
                                background: fuelColor,
                                boxShadow: `0 0 8px ${fuelColor}`,
                                borderRadius: '4px',
                                transition: 'width 0.3s, background 0.3s',
                                animation: fuel <= FUEL_WARNING_THRESHOLD ? 'pulse 0.5s ease-in-out infinite' : 'none'
                            }} />
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: fuelColor, marginTop: '4px', textAlign: 'center' }}>
                            {Math.round(fuel)}%
                        </div>
                    </div>

                    {/* Score */}
                    <div style={{
                        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
                        padding: '12px 20px', borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'right'
                    }}>
                        <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>Score</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                            {score.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Fuel Warning Indicator */}
                {fuel <= FUEL_WARNING_THRESHOLD && gameState === 'playing' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 25, display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '20px',
                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                            fontSize: '11px', fontWeight: 800, color: '#ef4444', letterSpacing: '1px',
                            textTransform: 'uppercase', animation: 'flash 0.6s ease-in-out infinite'
                        }}
                    >
                        <AlertTriangle size={12} /> Low Fuel!
                    </motion.div>
                )}

                {/* Obstacles & Pickups */}
                {obstacles.map(obs => (
                    !obs.hit && (
                        <div
                            key={obs.id}
                            style={{
                                position: 'absolute',
                                left: `${obs.lane * 33.33 + 16.66}%`,
                                top: `${obs.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '60px', height: '60px'
                            }}
                        >
                            {obs.type === 'coin' && (
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                                    border: '2px solid #fef08a',
                                    boxShadow: '0 0 15px rgba(251,191,36,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '10px', fontWeight: 900, color: '#92400e'
                                }}>$$</div>
                            )}
                            {obs.type === 'fuel_can' && (
                                <div style={{
                                    background: 'rgba(34,211,238,0.2)', border: '2px solid rgba(34,211,238,0.6)',
                                    borderRadius: '12px', padding: '8px',
                                    boxShadow: '0 0 20px rgba(34,211,238,0.4)',
                                    fontSize: '20px', animation: 'bounce 0.5s ease-in-out infinite'
                                }}>⛽</div>
                            )}
                            {obs.type === 'enemy' && (
                                <div style={{ fontSize: '36px', filter: 'drop-shadow(0 8px 8px rgba(239,68,68,0.5))' }}>🏎️</div>
                            )}
                        </div>
                    )
                ))}

                {/* Player Car */}
                <motion.div
                    style={{
                        position: 'absolute', bottom: '48px',
                        width: '64px', height: '96px', zIndex: 20
                    }}
                    animate={{
                        left: `${carLane * 33.33 + 16.66}%`,
                        rotate: (carLane - 1) * 6
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(180deg, #22d3ee, #1e40af)',
                        borderRadius: '16px',
                        border: '2px solid rgba(34,211,238,0.6)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', height: '18px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px' }} />
                        <div style={{ position: 'absolute', bottom: '10px', left: '8px', right: '8px', height: '14px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px' }} />
                        <div style={{ position: 'absolute', bottom: '4px', left: '6px', width: '14px', height: '5px', background: '#ef4444', borderRadius: '3px', boxShadow: '0 0 8px rgba(239,68,68,1)' }} />
                        <div style={{ position: 'absolute', bottom: '4px', right: '6px', width: '14px', height: '5px', background: '#ef4444', borderRadius: '3px', boxShadow: '0 0 8px rgba(239,68,68,1)' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '-16px', left: '50%', transform: 'translateX(-50%)', width: '50px', height: '20px', background: 'rgba(34,211,238,0.25)', borderRadius: '50%', filter: 'blur(8px)' }} />
                </motion.div>

                {/* Opponent Cars */}
                {Object.values(opponents).map(opp => (
                    <motion.div
                        key={opp.id}
                        style={{
                            position: 'absolute', bottom: '48px',
                            width: '64px', height: '96px', zIndex: 15,
                            opacity: 0.6
                        }}
                        animate={{
                            left: `${opp.lane * 33.33 + 16.66}%`,
                            rotate: (opp.lane - 1) * 6
                        }}
                    >
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(180deg, #ef4444, #991b1b)',
                            borderRadius: '16px',
                            border: '2px solid rgba(239,68,68,0.6)',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                            position: 'relative', overflow: 'hidden'
                        }}>
                             <div style={{ position: 'absolute', top: '4px', left: '0', right: '0', textAlign: 'center', fontSize: '8px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', background: 'rgba(0,0,0,0.4)', padding: '2px 0' }}>
                                {opp.name}
                             </div>
                             <div style={{ position: 'absolute', top: '18px', left: '8px', right: '8px', height: '14px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '15px', background: 'rgba(239,68,68,0.2)', borderRadius: '50%', filter: 'blur(6px)' }} />
                    </motion.div>
                ))}

                {/* Fuel Warning - Question Modal */}
                <AnimatePresence>
                    {gameState === 'fuel_warning' && currentQuestion && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(20px)' }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            style={{
                                position: 'absolute', inset: 0, zIndex: 50,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '20px',
                                background: 'rgba(10,10,32,0.92)',
                            }}
                        >
                            <div style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '32px', padding: '28px 24px',
                                textAlign: 'center',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                            }}>
                                {/* Alert header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '12px',
                                        background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <AlertTriangle size={18} color="#ef4444" />
                                    </div>
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    ⚡ FUEL CRITICAL
                                </div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '20px' }}>
                                    Answer correctly to refuel • Wrong = Game Over
                                </p>

                                <h3 style={{
                                    fontSize: '16px', fontWeight: 900, color: '#fff',
                                    marginBottom: '20px', lineHeight: 1.4,
                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}>
                                    {currentQuestion.text}
                                </h3>

                                {answerFeedback ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '16px',
                                            background: answerFeedback === 'correct'
                                                ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            border: `1px solid ${answerFeedback === 'correct' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                            color: answerFeedback === 'correct' ? '#4ade80' : '#ef4444',
                                            fontSize: '18px', fontWeight: 900
                                        }}
                                    >
                                        {answerFeedback === 'correct' ? '✅ Correct! Refueling...' : '❌ Wrong! Game Over!'}
                                    </motion.div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {currentQuestion.options.map((opt, i) => (
                                            <motion.button
                                                key={i}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleFuelAnswer(opt)}
                                                style={{
                                                    padding: '14px 8px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '2px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '14px', color: '#fff',
                                                    fontSize: '13px', fontWeight: 800,
                                                    cursor: 'pointer', fontFamily: 'inherit',
                                                    transition: 'all 0.2s', textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}
                                                onMouseEnter={e => {
                                                    e.target.style.borderColor = 'rgba(34,211,238,0.5)';
                                                    e.target.style.background = 'rgba(34,211,238,0.1)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    e.target.style.background = 'rgba(255,255,255,0.05)';
                                                }}
                                            >
                                                {opt}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Game Over */}
                {gameState === 'gameover' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            position: 'absolute', inset: 0, zIndex: 50,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
                            padding: '32px', textAlign: 'center'
                        }}
                    >
                        <div style={{ position: 'relative', marginBottom: '32px' }}>
                            <div style={{ position: 'absolute', inset: 0, background: '#fbbf24', filter: 'blur(60px)', opacity: 0.2 }} />
                            <Trophy style={{ color: '#fbbf24', width: '72px', height: '72px', filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.6))' }} />
                        </div>
                        <p style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '4px', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Race Terminated
                        </p>
                        <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '4px', letterSpacing: '-1px', fontStyle: 'italic' }}>
                            TOTAL SCORE
                        </h3>
                        <div style={{ fontSize: '64px', fontWeight: 900, color: '#22d3ee', marginBottom: '24px', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 25px rgba(34,211,238,0.5)' }}>
                            {score.toLocaleString()}
                        </div>

                        {/* Multiplayer Leaderboard */}
                        {multiplayerData && (
                            <div style={{ width: '100%', maxWidth: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '20px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Race Standings</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { name: user?.name, score: score, isYou: true },
                                        ...Object.values(opponents).map(o => ({ name: o.name, score: o.score, isYou: false }))
                                    ].sort((a,b) => b.score - a.score).map((entry, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: entry.isYou ? 'rgba(34,211,238,0.1)' : 'transparent', borderRadius: '12px', border: entry.isYou ? '1px solid rgba(34,211,238,0.3)' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 900, color: idx === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>#{idx+1}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: entry.isYou ? '#fff' : 'rgba(255,255,255,0.6)' }}>{entry.name}</span>
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 900, color: idx === 0 ? '#fbbf24' : '#fff' }}>{entry.score.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: 900, color: score >= Math.max(...Object.values(opponents).map(o => o.score), 0) ? '#4ade80' : '#ef4444' }}>
                                    {score >= Math.max(...Object.values(opponents).map(o => o.score), 0) ? '🏆 YOU WON!' : '🏳️ YOU LOST'}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '240px' }}>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={restartGame}
                                style={{
                                    padding: '16px', background: '#fff', color: '#000',
                                    fontWeight: 900, fontSize: '14px', borderRadius: '18px',
                                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                    letterSpacing: '2px', textTransform: 'uppercase',
                                    boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                                }}
                            >
                                🔄 Play Again
                            </motion.button>
                            <button
                                onClick={onBack}
                                style={{
                                    padding: '16px', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
                                    fontWeight: 800, fontSize: '13px', borderRadius: '18px',
                                    cursor: 'pointer', fontFamily: 'inherit',
                                    letterSpacing: '2px', textTransform: 'uppercase'
                                }}
                            >
                                Exit
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center', opacity: 0.4 }}>
                <button
                    onMouseDown={() => setCarLane(l => Math.max(0, l - 1))}
                    style={{
                        padding: '14px 20px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                        color: '#fff', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff', letterSpacing: '3px', textTransform: 'uppercase' }}>
                    Steer
                </span>
                <button
                    onMouseDown={() => setCarLane(l => Math.min(2, l + 1))}
                    style={{
                        padding: '14px 20px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                        color: '#fff', cursor: 'pointer'
                    }}
                >
                    <ArrowRight size={20} />
                </button>
            </div>

            <style>{`
                @keyframes moveRoad {
                    from { transform: translateY(0); }
                    to { transform: translateY(80px); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes flash {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

export default EndlessRunner;
