import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Shield, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import API_BASE from '../../config';

const LogicFlow = ({ user, onBack }) => {
    const [gameState, setGameState] = useState('lobby');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [target, setTarget] = useState(0);
    const [options, setOptions] = useState([]); // [{value, isCorrect}]
    const [selected, setSelected] = useState([]); // indices of selected buttons
    const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
    const [timeLeft, setTimeLeft] = useState(15);
    const [correctIndices, setCorrectIndices] = useState([]); // which indices are correct answer

    const generateLevel = useCallback((lvl) => {
        // Target grows with level: 10-20 early, up to 80+ later
        const targetVal = 10 + lvl * 3 + Math.floor(Math.random() * (lvl * 4 + 5));

        // Decide: 2 or 3 correct numbers?
        const numCorrect = lvl >= 3 ? (Math.random() < 0.5 ? 3 : 2) : 2;

        // Generate correct numbers that sum to targetVal
        const correctNums = [];
        let remaining = targetVal;
        for (let i = 0; i < numCorrect - 1; i++) {
            // Each correct number: 1 to remaining-1, ensuring others can still fill
            const maxVal = Math.floor(remaining / (numCorrect - i));
            const val = Math.max(1, Math.floor(Math.random() * maxVal));
            correctNums.push(val);
            remaining -= val;
        }
        correctNums.push(remaining); // last one fills up to exact target

        // Generate distractor numbers (wrong ones)
        const totalOptions = 4;
        const numDistractors = totalOptions - numCorrect;
        const allNums = [...correctNums];
        const existingSet = new Set(correctNums);

        for (let i = 0; i < numDistractors; i++) {
            let distractor;
            let tries = 0;
            do {
                // Distractors are close-ish to target range but don't complete the sum
                distractor = Math.max(1, Math.floor(Math.random() * (targetVal + 10)) + 1);
                tries++;
            } while (existingSet.has(distractor) && tries < 20);
            existingSet.add(distractor);
            allNums.push(distractor);
        }

        // Shuffle all 4 numbers and track which shuffled indices are "correct"
        const indexed = allNums.map((v, i) => ({ value: v, isCorrect: i < numCorrect }));
        const shuffled = indexed.sort(() => Math.random() - 0.5);

        const corrIdx = shuffled.reduce((acc, item, i) => item.isCorrect ? [...acc, i] : acc, []);

        setTarget(targetVal);
        setOptions(shuffled);
        setCorrectIndices(corrIdx);
        setSelected([]);
        setFeedback(null);
        setTimeLeft(Math.max(8, 18 - Math.floor(lvl / 2)));
    }, []);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || feedback) return;
        if (timeLeft <= 0) {
            setFeedback('timeout');
            setTimeout(() => setGameState('finished'), 1500);
            return;
        }
        const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft, gameState, feedback]);

    // Start trigger
    useEffect(() => {
        if (gameState === 'start_trigger') {
            setGameState('playing');
            generateLevel(1);
        }
    }, [gameState, generateLevel]);

    const toggleSelect = (idx) => {
        if (feedback) return;
        setSelected(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleSubmit = () => {
        if (feedback || selected.length === 0) return;

        const selectedSum = selected.reduce((acc, idx) => acc + options[idx].value, 0);

        if (selectedSum === target) {
            const timeBonus = timeLeft * 10;
            const points = level * 50 + timeBonus;
            setScore(s => s + points);
            setFeedback('correct');
            setTimeout(() => {
                const nextLevel = level + 1;
                setLevel(nextLevel);
                generateLevel(nextLevel);
            }, 1200);
        } else {
            setFeedback('wrong');
            setTimeout(() => setGameState('finished'), 1500);
        }
    };

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

    const handleStart = () => {
        setScore(0);
        setLevel(1);
        setSelected([]);
        setFeedback(null);
        setGameState('start_trigger');
    };

    const selectedSum = selected.reduce((acc, idx) => acc + (options[idx]?.value || 0), 0);
    const timePercent = (timeLeft / 18) * 100;

    // ─── LOBBY ───────────────────────────────────────────────────────────────
    if (gameState === 'lobby') {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #020617 0%, #0c1a2e 50%, #010c1a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px', fontFamily: "'Outfit', sans-serif", position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.08), transparent 70%)', pointerEvents: 'none' }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        maxWidth: '480px', width: '100%', textAlign: 'center',
                        padding: '56px 48px', borderRadius: '48px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(30px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                        position: 'relative', zIndex: 10
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{
                            width: '96px', height: '96px', margin: '0 auto 32px',
                            background: 'rgba(56,189,248,0.15)', border: '2px solid rgba(56,189,248,0.4)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 50px rgba(56,189,248,0.25)'
                        }}
                    >
                        <Activity size={48} color="#38bdf8" />
                    </motion.div>

                    <h1 style={{ fontSize: '52px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-3px', fontStyle: 'italic', textTransform: 'uppercase' }}>
                        Logic<span style={{ color: '#38bdf8' }}>Flow</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '40px' }}>
                        Pick numbers that sum to the target
                    </p>

                    {/* How to play */}
                    <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>How to Play</div>
                        {[
                            '🎯 A target number appears at the top',
                            '🔢 Select 2–3 numbers below that ADD UP to the target',
                            '✅ Press CHECK to submit your answer',
                            '⚡ Go over = GAME OVER immediately',
                        ].map((tip, i) => (
                            <div key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: 600 }}>{tip}</div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(56,189,248,0.4)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleStart}
                        style={{
                            width: '100%', padding: '22px',
                            background: '#38bdf8', color: '#020617',
                            border: 'none', borderRadius: '24px',
                            fontSize: '20px', fontWeight: 900, cursor: 'pointer',
                            fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase',
                            boxShadow: '0 8px 30px rgba(56,189,248,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                        }}
                    >
                        <Shield size={22} /> START GAME
                    </motion.button>
                    <button onClick={onBack} style={{
                        marginTop: '20px', background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase'
                    }}>
                        ← Back to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─── FINISHED ─────────────────────────────────────────────────────────────
    if (gameState === 'finished') {
        return (
            <div style={{
                minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0c1a2e 50%, #010c1a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px', fontFamily: "'Outfit', sans-serif"
            }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{
                        maxWidth: '440px', width: '100%', textAlign: 'center',
                        padding: '56px 48px', borderRadius: '48px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                    }}
                >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '72px', marginBottom: '16px' }}>
                        🏆
                    </motion.div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
                        Session Complete
                    </div>
                    <div style={{ fontSize: '80px', fontWeight: 900, color: '#fff', letterSpacing: '-4px', lineHeight: 1, marginBottom: '8px' }}>
                        {score}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 600, marginBottom: '40px' }}>
                        Reached Level {level}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={handleStart}
                            style={{
                                padding: '20px', background: '#fff', color: '#020617',
                                border: 'none', borderRadius: '20px', fontSize: '16px', fontWeight: 900,
                                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <RefreshCw size={18} /> Play Again
                        </motion.button>
                        <button onClick={onBack} style={{
                            padding: '20px', background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
                            color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase'
                        }}>
                            Exit
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── PLAYING ──────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #010204 0%, #041020 60%, #010817 100%)',
            color: '#fff', padding: '24px 24px 100px',
            fontFamily: "'Outfit', sans-serif",
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', overflow: 'hidden', boxSizing: 'border-box'
        }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'rgba(56,189,248,0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* ── HUD ── */}
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', position: 'relative', zIndex: 10 }}>
                <button onClick={onBack} style={{
                    padding: '10px 18px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                    color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <ArrowLeft size={15} /> Back
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                        { label: 'Level', value: level, color: '#38bdf8' },
                        { label: 'Score', value: score, color: '#fff' },
                    ].map((h, i) => (
                        <div key={i} style={{
                            padding: '8px 16px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>{h.label}</div>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: h.color }}>{h.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Timer bar ── */}
            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Time Remaining</span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: timeLeft <= 4 ? '#ef4444' : '#38bdf8' }}>{timeLeft}s</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ width: `${(timeLeft / 18) * 100}%` }}
                        transition={{ ease: 'linear', duration: 1 }}
                        style={{
                            height: '100%', borderRadius: '4px',
                            background: timeLeft <= 4 ? '#ef4444' : '#38bdf8',
                            boxShadow: `0 0 10px ${timeLeft <= 4 ? '#ef4444' : 'rgba(56,189,248,0.6)'}`
                        }}
                    />
                </div>
            </div>

            {/* ── TARGET ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={level}
                    initial={{ y: -20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    style={{
                        width: '100%', maxWidth: '600px', textAlign: 'center',
                        background: 'rgba(56,189,248,0.07)', border: '2px solid rgba(56,189,248,0.3)',
                        borderRadius: '28px', padding: '32px 24px', marginBottom: '24px',
                        boxShadow: '0 0 50px rgba(56,189,248,0.08)', position: 'relative', zIndex: 10
                    }}
                >
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(56,189,248,0.7)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        🎯 Target — Select numbers that add up to:
                    </div>
                    <div style={{ fontSize: '88px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-4px', fontStyle: 'italic' }}>
                        {target}
                    </div>
                    {/* Running sum hint */}
                    <div style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                        Selected sum:{' '}
                        <span style={{ color: selectedSum === target ? '#4ade80' : selectedSum > target ? '#ef4444' : '#38bdf8', fontWeight: 900 }}>
                            {selectedSum}
                        </span>
                        {selectedSum > target && <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '8px' }}>⚠ Over target!</span>}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── NUMBER BUTTONS ── */}
            <div style={{ width: '100%', maxWidth: '600px', position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '14px' }}>
                    Tap to select numbers → then press CHECK
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
                    {options.map((opt, idx) => {
                        const isSelected = selected.includes(idx);
                        const wouldOverflow = !isSelected && selectedSum + opt.value > target;

                        return (
                            <motion.button
                                key={idx}
                                whileHover={!feedback ? { scale: 1.04, y: -3 } : {}}
                                whileTap={!feedback ? { scale: 0.96 } : {}}
                                onClick={() => toggleSelect(idx)}
                                disabled={!!feedback}
                                style={{
                                    padding: '28px 16px',
                                    background: isSelected
                                        ? 'rgba(56,189,248,0.18)'
                                        : 'rgba(255,255,255,0.04)',
                                    border: `2px solid ${isSelected
                                        ? '#38bdf8'
                                        : wouldOverflow
                                            ? 'rgba(239,68,68,0.3)'
                                            : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '22px',
                                    cursor: feedback ? 'default' : 'pointer',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '6px', fontFamily: 'inherit',
                                    boxShadow: isSelected ? '0 0 25px rgba(56,189,248,0.2)' : 'none',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                {/* Selected checkmark badge */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            background: '#38bdf8', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <Check size={13} color="#020617" strokeWidth={3} />
                                    </motion.div>
                                )}

                                {/* Show correct/wrong overlay after feedback */}
                                {feedback && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{
                                            position: 'absolute', inset: 0, borderRadius: '20px',
                                            background: opt.isCorrect
                                                ? 'rgba(74,222,128,0.15)'
                                                : selected.includes(idx) && !opt.isCorrect
                                                    ? 'rgba(239,68,68,0.15)'
                                                    : 'transparent',
                                            border: `2px solid ${opt.isCorrect ? 'rgba(74,222,128,0.5)' : 'transparent'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '28px', borderRadius: '20px'
                                        }}
                                    >
                                        {opt.isCorrect ? '✅' : ''}
                                    </motion.div>
                                )}

                                <span style={{ fontSize: '42px', fontWeight: 900, color: isSelected ? '#38bdf8' : '#fff', letterSpacing: '-2px' }}>
                                    {opt.value}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* ── CHECK BUTTON ── */}
                <AnimatePresence>
                    {!feedback && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            whileHover={selected.length > 0 ? { scale: 1.03 } : {}}
                            whileTap={selected.length > 0 ? { scale: 0.97 } : {}}
                            onClick={handleSubmit}
                            disabled={selected.length === 0}
                            style={{
                                width: '100%', padding: '20px',
                                background: selected.length > 0 ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                                border: selected.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px', color: selected.length > 0 ? '#020617' : 'rgba(255,255,255,0.2)',
                                fontSize: '17px', fontWeight: 900, cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                                fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase',
                                boxShadow: selected.length > 0 ? '0 8px 30px rgba(56,189,248,0.3)' : 'none',
                                transition: 'all 0.3s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <Check size={20} strokeWidth={3} /> Check Answer ({selectedSum})
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* ── FEEDBACK ── */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            style={{
                                marginTop: '16px', padding: '20px', borderRadius: '20px', textAlign: 'center',
                                background: feedback === 'correct' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${feedback === 'correct' ? 'rgba(74,222,128,0.35)' : 'rgba(239,68,68,0.35)'}`,
                                color: feedback === 'correct' ? '#4ade80' : '#ef4444',
                                fontSize: '18px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '1px'
                            }}
                        >
                            {feedback === 'correct'
                                ? `⚡ CORRECT! +${level * 50 + timeLeft * 10} pts → Level ${level + 1}`
                                : feedback === 'timeout'
                                    ? '⏰ TIME UP! Game Over'
                                    : `💥 Wrong! ${selectedSum} ≠ ${target}`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom bar */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, width: '100%',
                padding: '14px 32px', borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box'
            }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '2px' }}>BR-LF-{level}</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(56,189,248,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }}>Logic Sync • Active</span>
            </div>
        </div>
    );
};

export default LogicFlow;
