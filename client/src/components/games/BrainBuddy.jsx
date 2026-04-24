import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Zap, Star, Clock, Check, X } from 'lucide-react';
import API_BASE from '../../config';

const IMAGE_EXTENSIONS = {
    'cheetah': 'jpeg',
    'frog': 'jpeg',
    'giraffe': 'jpeg',
    'fox': 'jfif',
    'spider': 'jfif',
    'mouse': 'jfif',
    'eagle': 'jfif',
    'monkey': 'jfif',
    'owl': 'jfif',
};

// Helper to get image path
const getAnimalDisplay = (opt) => {
    const label = opt.label.toLowerCase();
    const ext = IMAGE_EXTENSIONS[label] || 'jpg';
    const imagePath = `/assets/animals/${label}.${ext}`;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                src={imagePath}
                alt={opt.label}
                onError={(e) => {
                    // Fail over to emoji if image fails to load
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
                style={{
                    maxWidth: '100%',
                    maxHeight: '130px', // Uniform height
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))',
                    borderRadius: '16px'
                }}
            />
            <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '100px' }}>
                {opt.emoji}
            </div>
        </div>
    );
};

// Visual trivia questions
const VISUAL_QUESTIONS = [
    {
        question: "Which one is the BIGGEST?",
        options: [
            { label: "Elephant", emoji: "🐘" },
            { label: "Mouse", emoji: "🐭" },
            { label: "Zebra", emoji: "🦓" },
            { label: "Cat", emoji: "🐱" },
        ],
        correct: "Elephant",
        explanation: "Elephants are the largest land animals!"
    },
    {
        question: "Which one can FLY?",
        options: [
            { label: "Dog", emoji: "🐶" },
            { label: "Eagle", emoji: "🦅" },
            { label: "Fish", emoji: "🐟" },
            { label: "Horse", emoji: "🐴" },
        ],
        correct: "Eagle",
        explanation: "Eagles are powerful birds that soar through the sky!"
    },
    {
        question: "Which one lives in the OCEAN?",
        options: [
            { label: "Lion", emoji: "🦁" },
            { label: "Monkey", emoji: "🐒" },
            { label: "Whale", emoji: "🐳" },
            { label: "Rabbit", emoji: "🐰" },
        ],
        correct: "Whale",
        explanation: "Whales are the giants of the ocean!"
    },
    {
        question: "Which animal has a LONG neck?",
        options: [
            { label: "Frog", emoji: "🐸" },
            { label: "Bear", emoji: "🐻" },
            { label: "Giraffe", emoji: "🦒" },
            { label: "Duck", emoji: "🦆" },
        ],
        correct: "Giraffe",
        explanation: "A giraffe's neck can be up to 6 feet long!"
    },
    {
        question: "Which one makes HONEY?",
        options: [
            { label: "Spider", emoji: "🕷️" },
            { label: "Bee", emoji: "🐝" },
            { label: "Butterfly", emoji: "🦋" },
            { label: "Ant", emoji: "🐜" },
        ],
        correct: "Bee",
        explanation: "Bees produce delicious honey in their hives!"
    },
    {
        question: "Which animal has STRIPES?",
        options: [
            { label: "Elephant", emoji: "🐘" },
            { label: "Giraffe", emoji: "🦒" },
            { label: "Tiger", emoji: "🐯" },
            { label: "Penguin", emoji: "🐧" },
        ],
        correct: "Tiger",
        explanation: "Tigers have beautiful orange and black stripes!"
    },
    {
        question: "Which one can SWIM best?",
        options: [
            { label: "Cat", emoji: "🐱" },
            { label: "Horse", emoji: "🐴" },
            { label: "Dolphin", emoji: "🐬" },
            { label: "Chicken", emoji: "🐔" },
        ],
        correct: "Dolphin",
        explanation: "Dolphins are incredible swimmers and very intelligent!"
    },
    {
        question: "Which animal HOPS?",
        options: [
            { label: "Crocodile", emoji: "🐊" },
            { label: "Kangaroo", emoji: "🦘" },
            { label: "Elephant", emoji: "🐘" },
            { label: "Fish", emoji: "🐟" },
        ],
        correct: "Kangaroo",
        explanation: "Kangaroos can hop at speeds up to 35 mph!"
    },
    {
        question: "Which one is a REPTILE?",
        options: [
            { label: "Rabbit", emoji: "🐰" },
            { label: "Turtle", emoji: "🐢" },
            { label: "Dog", emoji: "🐶" },
            { label: "Owl", emoji: "🦉" },
        ],
        correct: "Turtle",
        explanation: "Turtles are reptiles that have existed for over 200 million years!"
    },
    {
        question: "Which animal is the FASTEST on land?",
        options: [
            { label: "Elephant", emoji: "🐘" },
            { label: "Lion", emoji: "🦁" },
            { label: "Cheetah", emoji: "🐆" },
            { label: "Horse", emoji: "🐴" },
        ],
        correct: "Cheetah",
        explanation: "Cheetahs can run at 70 mph – they're the fastest land animals!"
    },
    {
        question: "Which one has a TRUNK?",
        options: [
            { label: "Bear", emoji: "🐻" },
            { label: "Giraffe", emoji: "🦒" },
            { label: "Elephant", emoji: "🐘" },
            { label: "Hippo", emoji: "🦛" },
        ],
        correct: "Elephant",
        explanation: "An elephant's trunk is a powerful, sensitive nose!"
    },
    {
        question: "Which animal lives in a DEN?",
        options: [
            { label: "Fish", emoji: "🐟" },
            { label: "Fox", emoji: "🦊" },
            { label: "Parrot", emoji: "🦜" },
            { label: "Whale", emoji: "🐳" },
        ],
        correct: "Fox",
        explanation: "Foxes dig underground dens to raise their young!"
    },
];

const BrainBuddy = ({ user, onBack }) => {
    const [gameState, setGameState] = useState('lobby'); // lobby, playing, finished
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [selectedOption, setSelectedOption] = useState(null);
    const [status, setStatus] = useState(null); // 'correct' | 'wrong'
    const [timer, setTimer] = useState(20);
    const [streak, setStreak] = useState(0);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [opponents, setOpponents] = useState({});
    const [teamScores, setTeamScores] = useState({ Red: 0, Blue: 0 });
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/questions?gameType=brain-buddy`);
                const data = await res.json();
                const gameSpecific = data.filter(q => q.gameType === 'brain-buddy');
                
                if (gameSpecific.length > 0) {
                    // Format backend questions to match frontend structure
                    const formatted = gameSpecific.map(q => ({
                        question: q.questionText,
                        options: q.options.map(opt => ({ label: opt, emoji: '❓' })),
                        correct: q.correctAnswer,
                        explanation: `The correct answer is ${q.correctAnswer}!`
                    }));
                    setQuestions(formatted.sort(() => Math.random() - 0.5));
                } else {
                    setQuestions([...VISUAL_QUESTIONS].sort(() => Math.random() - 0.5));
                }
            } catch (err) {
                console.error("Failed to fetch questions:", err);
                setQuestions([...VISUAL_QUESTIONS].sort(() => Math.random() - 0.5));
            }
        };
        fetchQuestions();
    }, []);

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
            setGameState('finished');
        });

        return () => {
            socket.off('opponentUpdate');
            socket.off('scoreUpdate');
            socket.off('gameOver');
        };
    }, [socket]);

    useEffect(() => {
        if (gameState !== 'playing' || status) return;

        if (socket && multiplayerData?.roomId) {
            socket.emit('playerUpdate', {
                id: socket.id,
                roomId: multiplayerData.roomId,
                name: user?.name || 'Player',
                score: score,
                team: multiplayerData.team,
                currentIdx: currentIdx
            });
        }

        timerRef.current = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    handleAnswer(null); // Time out
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [gameState, currentIdx, status, score, socket, multiplayerData]);

    const handleAnswer = (option) => {
        if (status) return;
        clearInterval(timerRef.current);
        setSelectedOption(option);

        const currentQ = questions[currentIdx];
        const isCorrect = option === currentQ?.correct;

        if (isCorrect) {
            const timeBonus = timer * 15;
            const streakBonus = streak * 50;
            const points = 100 + timeBonus + streakBonus;
            setScore(s => s + points);
            setStreak(str => str + 1);
            setTotalCorrect(c => c + 1);
            setStatus('correct');

            if (socket && multiplayerData?.roomId) {
                socket.emit('submitAnswer', {
                    roomId: multiplayerData.roomId,
                    isCorrect: true,
                    team: multiplayerData.team,
                    points: 10
                });
            }
        } else {
            setStreak(0);
            setLives(l => l - 1);
            setStatus('wrong');
            if (lives <= 1) {
                // Game over after showing wrong feedback
                setTimeout(() => {
                    saveScore(score);
                    setGameState('finished');
                }, 1800);
                return;
            }
        }

        setShowExplanation(true);

        setTimeout(() => {
            setShowExplanation(false);
            setStatus(null);
            setSelectedOption(null);
            setTimer(20);

            if (currentIdx < questions.length - 1) {
                setCurrentIdx(i => i + 1);
            } else {
                saveScore(score + (isCorrect ? (100 + timer * 15 + streak * 50) : 0));
                setGameState('finished');
            }
        }, 2000);
    };

    const saveScore = async (finalScore) => {
        try {
            await fetch(`${API_BASE}/api/update-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: user?.name, score: finalScore })
            });
        } catch (e) { console.error(e); }
    };

    const restartGame = () => {
        const shuffled = [...VISUAL_QUESTIONS].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentIdx(0);
        setScore(0);
        setLives(3);
        setSelectedOption(null);
        setStatus(null);
        setTimer(20);
        setStreak(0);
        setTotalCorrect(0);
        setShowExplanation(false);
        setGameState('playing');
    };

    const currentQ = questions[currentIdx];
    const timerPercent = (timer / 20) * 100;

    // LOBBY
    if (gameState === 'lobby') {
        return (
            <div style={{
                minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 50%, #0a1628 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px', fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Background decorations */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -20, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
                        style={{
                            position: 'absolute',
                            fontSize: ['40px', '50px', '35px', '45px', '38px', '52px', '42px', '36px'][i],
                            top: `${[10, 5, 20, 70, 80, 15, 60, 85][i]}%`,
                            left: `${[5, 30, 80, 90, 10, 65, 75, 45][i]}%`,
                            opacity: 0.15, pointerEvents: 'none',
                        }}
                    >
                        {['🐘', '🦁', '🐬', '🦒', '🦋', '🐯', '🦅', '🐢'][i]}
                    </motion.div>
                ))}

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    style={{
                        maxWidth: '480px', width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '40px', padding: '56px 48px',
                        textAlign: 'center', backdropFilter: 'blur(30px)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
                        position: 'relative', zIndex: 10
                    }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{
                            width: '100px', height: '100px',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            borderRadius: '30px', margin: '0 auto 28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '54px', boxShadow: '0 0 40px rgba(245,158,11,0.3)',
                            transform: 'rotate(6deg)',
                        }}
                    >
                        🚀
                    </motion.div>

                    <h1 style={{
                        fontSize: '48px', fontWeight: 900, color: '#fff',
                        marginBottom: '8px', letterSpacing: '-2px',
                        fontStyle: 'italic', textTransform: 'uppercase'
                    }}>
                        BRAIN<br />
                        <span style={{
                            background: 'linear-gradient(to right, #f59e0b, #ec4899)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>BUDDY</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 600, marginBottom: '36px', letterSpacing: '1px' }}>
                        Visual Animal Quiz • Test Your Knowledge!
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '36px' }}>
                        {[
                            { icon: '❤️', label: '3 Lives' },
                            { icon: '⏱️', label: '20s Timer' },
                            { icon: '🔥', label: 'Streak Bonus' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                padding: '16px 12px', background: 'rgba(255,255,255,0.04)',
                                borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.icon}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{f.label}</div>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(245,158,11,0.4)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { restartGame(); }}
                        style={{
                            width: '100%', padding: '20px',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            border: 'none', borderRadius: '20px',
                            color: '#fff', fontSize: '18px', fontWeight: 900,
                            letterSpacing: '2px', textTransform: 'uppercase',
                            cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: '0 8px 30px rgba(245,158,11,0.3)'
                        }}
                    >
                        🚀 Start Quiz!
                    </motion.button>

                    <button onClick={onBack} style={{
                        marginTop: '20px', background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)', fontSize: '13px',
                        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                        letterSpacing: '1px', textTransform: 'uppercase'
                    }}>
                        ← Back to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    // FINISHED
    if (gameState === 'finished') {
        const accuracy = questions.length > 0 ? Math.round((totalCorrect / Math.min(currentIdx + 1, questions.length)) * 100) : 0;
        const rank = score > 3000 ? '🏆 Champion' : score > 1500 ? '⭐ Star' : score > 500 ? '🎯 Learner' : '🌱 Beginner';

        return (
            <div style={{
                minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 50%, #0a1628 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px', fontFamily: "'Outfit', sans-serif"
            }}>
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        maxWidth: '480px', width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '40px', padding: '52px 44px',
                        textAlign: 'center', backdropFilter: 'blur(20px)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.4)'
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '72px', marginBottom: '16px' }}
                    >
                        🏆
                    </motion.div>

                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '4px', letterSpacing: '-1px' }}>
                        Quiz Complete!
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 600, marginBottom: '32px' }}>
                        You are a {rank}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                        {[
                            { label: 'Final Score', value: score.toLocaleString(), color: '#f59e0b' },
                            { label: 'Correct', value: `${totalCorrect}/${Math.min(currentIdx + 1, questions.length)}`, color: '#4ade80' },
                            { label: 'Accuracy', value: `${accuracy}%`, color: '#22d3ee' },
                            { label: 'Best Streak', value: `${streak}x`, color: '#ec4899' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                padding: '20px 16px', background: 'rgba(255,255,255,0.04)',
                                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{stat.label}</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={restartGame}
                            style={{
                                padding: '18px', background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                border: 'none', borderRadius: '18px', color: '#fff',
                                fontSize: '15px', fontWeight: 900, cursor: 'pointer',
                                fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase'
                            }}
                        >
                            🔄 Play Again
                        </motion.button>
                        <button
                            onClick={onBack}
                            style={{
                                padding: '18px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px',
                                color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit',
                                letterSpacing: '1px', textTransform: 'uppercase'
                            }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // PLAYING
    if (!currentQ) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 50%, #0a1628 100%)',
            fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '20px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden'
        }}>
            {/* HUD */}
            <div style={{
                width: '100%', maxWidth: '700px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '20px', gap: '12px'
            }}>
                {/* Back */}
                {/* Back */}
                <button onClick={onBack} style={{
                    padding: '10px 16px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'inherit'
                }}>
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Team Progress HUD (Multiplayer) */}
                {multiplayerData && (
                    <div style={{
                        position: 'fixed', top: '20px', right: '20px', zIndex: 100,
                        width: '180px', background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)', borderRadius: '24px',
                        padding: '16px', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textAlign: 'center' }}>TEAM PROGRESS</div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900, color: '#ef4444', marginBottom: '3px' }}>
                                <span>RED</span>
                                <span>{teamScores.Red}</span>
                            </div>
                            <div style={{ height: '5px', background: 'rgba(239,68,68,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <motion.div animate={{ width: `${(teamScores.Red / 200) * 100}%` }} style={{ height: '100%', background: '#ef4444' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900, color: '#3b82f6', marginBottom: '3px' }}>
                                <span>BLUE</span>
                                <span>{teamScores.Blue}</span>
                            </div>
                            <div style={{ height: '5px', background: 'rgba(59,130,246,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <motion.div animate={{ width: `${(teamScores.Blue / 200) * 100}%` }} style={{ height: '100%', background: '#3b82f6' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Score */}
                <div style={{
                    padding: '10px 20px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Score</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#f59e0b' }}>{score.toLocaleString()}</div>
                </div>

                {/* Opponents (Multiplayer Mini-Map) */}
                {multiplayerData && Object.keys(opponents).length > 0 && (
                    <div style={{
                        position: 'fixed', left: '20px', top: '100px', display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                        {Object.values(opponents).map(opp => (
                            <div key={opp.id} style={{
                                padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px', borderLeft: `4px solid ${opp.team === 'Red' ? '#ef4444' : '#3b82f6'}`,
                                fontSize: '11px', color: '#fff', fontWeight: 600
                            }}>
                                {opp.name}: Q{opp.currentIdx + 1}
                            </div>
                        ))}
                    </div>
                )}

                {/* Lives + Streak */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[...Array(3)].map((_, i) => (
                            <span key={i} style={{ fontSize: '20px', opacity: i < lives ? 1 : 0.2 }}>❤️</span>
                        ))}
                    </div>
                    {streak > 1 && (
                        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800 }}>🔥 {streak}x Streak</div>
                    )}
                </div>
            </div>

            {/* Timer bar */}
            <div style={{ width: '100%', maxWidth: '700px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                        Question {currentIdx + 1} / {questions.length}
                    </span>
                    <span style={{
                        fontSize: '14px', fontWeight: 900,
                        color: timer <= 5 ? '#ef4444' : timer <= 10 ? '#f59e0b' : '#22d3ee',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <Clock size={14} /> {timer}s
                    </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ width: `${timerPercent}%` }}
                        transition={{ ease: 'linear', duration: 1 }}
                        style={{
                            height: '100%', borderRadius: '4px',
                            background: timer <= 5 ? '#ef4444' : timer <= 10 ? '#f59e0b' : '#22d3ee',
                            boxShadow: `0 0 10px ${timer <= 5 ? '#ef4444' : '#22d3ee'}`
                        }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    style={{
                        width: '100%', maxWidth: '700px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '32px', padding: '36px 32px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <h2 style={{
                        fontSize: '22px', fontWeight: 900, color: '#fff',
                        textAlign: 'center', marginBottom: '32px',
                        textTransform: 'uppercase', letterSpacing: '1px',
                        lineHeight: 1.3
                    }}>
                        {currentQ.question}
                    </h2>

                    {/* Animal Options Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                    }}>
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = selectedOption === opt.label;
                            const isCorrectOpt = opt.label === currentQ.correct;
                            let borderColor = 'rgba(255,255,255,0.1)';
                            let bg = 'rgba(255,255,255,0.04)';
                            let glow = 'none';

                            if (status && isCorrectOpt) {
                                borderColor = 'rgba(74,222,128,0.6)';
                                bg = 'rgba(74,222,128,0.12)';
                                glow = '0 0 20px rgba(74,222,128,0.2)';
                            } else if (status === 'wrong' && isSelected) {
                                borderColor = 'rgba(239,68,68,0.6)';
                                bg = 'rgba(239,68,68,0.12)';
                                glow = '0 0 20px rgba(239,68,68,0.2)';
                            } else if (!status && isSelected) {
                                borderColor = 'rgba(34,211,238,0.5)';
                                bg = 'rgba(34,211,238,0.08)';
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={!status ? { scale: 1.04, y: -4 } : {}}
                                    whileTap={!status ? { scale: 0.97 } : {}}
                                    onClick={() => handleAnswer(opt.label)}
                                    disabled={!!status}
                                    style={{
                                        padding: '24px 16px',
                                        background: bg,
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '24px',
                                        cursor: status ? 'default' : 'pointer',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        gap: '8px', position: 'relative',
                                        boxShadow: glow, transition: 'all 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    {/* Animal image container */}
                                    <div style={{
                                        width: '100%', height: '140px',
                                        lineHeight: 1, userSelect: 'none',
                                        filter: status && !isCorrectOpt && !isSelected ? 'grayscale(80%) opacity(0.5)' : 'none',
                                        transition: 'filter 0.3s',
                                    }}>
                                        {getAnimalDisplay(opt)}
                                    </div>

                                    <span style={{
                                        fontSize: '14px', fontWeight: 800, color: '#fff',
                                        letterSpacing: '0.5px', textTransform: 'uppercase'
                                    }}>
                                        {opt.label}
                                    </span>

                                    {/* Status indicator */}
                                    {status && isCorrectOpt && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                                position: 'absolute', top: '12px', right: '12px',
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: '#4ade80', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', zIndex: 10
                                            }}
                                        >
                                            <Check size={16} color="#000" />
                                        </motion.div>
                                    )}
                                    {status === 'wrong' && isSelected && !isCorrectOpt && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                                position: 'absolute', top: '12px', right: '12px',
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: '#ef4444', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', zIndex: 10
                                            }}
                                        >
                                            <X size={16} color="#fff" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                        {showExplanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    marginTop: '20px', padding: '16px 20px',
                                    background: status === 'correct'
                                        ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
                                    border: `1px solid ${status === 'correct' ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                    borderRadius: '16px', textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '18px', marginBottom: '6px' }}>
                                    {status === 'correct' ? '✅' : '❌'}
                                </div>
                                <p style={{
                                    color: status === 'correct' ? '#4ade80' : '#ef4444',
                                    fontWeight: 700, fontSize: '14px'
                                }}>
                                    {status === 'correct' ? `+${100 + timer * 15 + (streak - 1) * 50} points!` : 'Not quite!'}
                                    {' '}<span style={{ color: 'rgba(255,255,255,0.6)' }}>{currentQ.explanation}</span>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default BrainBuddy;
