import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Heart, X, Timer } from 'lucide-react';
import API_BASE from '../../config';

/* ─── Level Config ─────────────────────────────────────────────── */
const LEVELS = {
    easy: {
        label: 'Easy', emoji: '🌤️', color: '#4ade80',
        speedPct: 5, spawnInterval: 3000,
        ops: ['+', '-'], maxNum: 12,
        description: 'Simple addition & subtraction',
        sky: ['#56badd', '#3bc8e7', '#7de0f0'],
        timeLimit: 90,   // seconds
    },
    medium: {
        label: 'Medium', emoji: '🌧️', color: '#38bdf8',
        speedPct: 9, spawnInterval: 2500,
        ops: ['+', '-', '×'], maxNum: 20,
        description: 'Includes multiplication',
        sky: ['#1e4d7a', '#2980b9', '#3bc8e7'],
        timeLimit: 75,
    },
    hard: {
        label: 'Hard', emoji: '⛈️', color: '#f97316',
        speedPct: 14, spawnInterval: 1800,
        ops: ['+', '-', '×', '÷'], maxNum: 25,
        description: 'All ops — race the rain!',
        sky: ['#1a1a2e', '#2d1b3d', '#3d2650'],
        timeLimit: 60,
    },
};

/* ─── Helpers ──────────────────────────────────────────────────── */
let _id = 0;
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeDrop(lk) {
    const cfg = LEVELS[lk];
    const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
    let a, b, answer;
    if (op === '+') { a = rand(1, cfg.maxNum); b = rand(1, cfg.maxNum); answer = a + b; }
    else if (op === '-') { a = rand(6, cfg.maxNum); b = rand(1, a - 1); answer = a - b; }
    else if (op === '×') { a = rand(2, 11); b = rand(2, 11); answer = a * b; }
    else { b = rand(2, 10); answer = rand(2, 10); a = b * answer; }
    return {
        id: ++_id,
        label: `${a} ${op} ${b}`,
        answer,
        x: rand(10, 80),
        y: -6,
        isBubble: Math.random() < 0.25,
    };
}

/* ─── Canvas drawing ───────────────────────────────────────────── */
function drawSky(ctx, cw, ch, colors) {
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, colors[0]);
    g.addColorStop(0.55, colors[1]);
    g.addColorStop(1, colors[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
}

function drawDrop(ctx, drop, cw, ch) {
    const cx = (drop.x / 100) * cw;
    const cy = (drop.y / 100) * ch;
    ctx.save();
    ctx.translate(cx, cy);
    if (drop.isBubble) {
        const r = 40;
        const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, r);
        g.addColorStop(0, '#ffe07a');
        g.addColorStop(1, '#f5a623');
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#d4870a';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-13, -14, 9, 5, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#7c4a00';
        ctx.fillText(drop.label, 0, 0);
    } else {
        const g = ctx.createLinearGradient(-22, -46, 22, 40);
        g.addColorStop(0, '#4a9fd4');
        g.addColorStop(1, '#1a3d5c');
        ctx.beginPath();
        ctx.moveTo(0, -46);
        ctx.bezierCurveTo(-28, -8, -28, 18, 0, 36);
        ctx.bezierCurveTo(28, 18, 28, -8, 0, -46);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-9, -6, 5, 12, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(drop.label, 0, 5);
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawFeedbacks(ctx, feedbacks, cw, ch) {
    const now = performance.now();
    return feedbacks.filter(fb => {
        const t = (now - fb.born) / 650;
        if (t >= 1) return false;
        const cx = (fb.x / 100) * cw;
        const cy = (fb.y / 100) * ch - t * 55;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.font = `bold ${20 + t * 8}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = fb.type === 'success' ? '#fad666' : '#ff6b6b';
        ctx.shadowColor = fb.type === 'success' ? 'rgba(250,214,102,0.9)' : 'rgba(255,100,100,0.9)';
        ctx.shadowBlur = 10;
        ctx.fillText(fb.text, cx, cy);
        ctx.shadowBlur = 0;
        ctx.restore();
        return true;
    });
}

/* ─── Timer ring helper ────────────────────────────────────────── */
function TimerRing({ timeLeft, timeLimit, color }) {
    const r = 22;
    const circ = 2 * Math.PI * r;
    const pct = Math.max(0, timeLeft / timeLimit);
    const dash = pct * circ;
    const isLow = timeLeft <= 10;
    const ringColor = isLow ? '#ef4444' : color;

    return (
        <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="56" height="56" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                {/* Progress */}
                <circle
                    cx="28" cy="28" r={r}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="4"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }}
                />
            </svg>
            <span style={{
                fontSize: 14, fontWeight: 900, color: isLow ? '#ef4444' : '#fff',
                animation: isLow ? 'pulse 0.6s ease-in-out infinite alternate' : 'none',
            }}>
                {timeLeft}
            </span>
        </div>
    );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function MathDrops({ user, onBack }) {
    const [phase, setPhase] = useState('menu');      // menu | playing | over
    const [levelKey, setLevelKey] = useState('easy');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(90);
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('mdhigh') || '0'));

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

    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const gs = useRef({
        drops: [], feedbacks: [],
        speedMult: 1, lastTime: null, lastSpawn: 0,
        lives: 3, score: 0, input: '',
        levelKey: 'easy', phase: 'menu',
        timeLeft: 90, lastSecond: 0,
    });

    /* ── End game ──────────────────────────────────────────────── */
    const endGame = useCallback((reason) => {
        const s = gs.current;
        s.phase = 'over';
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const hs = Math.max(s.score, parseInt(localStorage.getItem('mdhigh') || '0'));
        localStorage.setItem('mdhigh', String(hs));
        setHighScore(hs);
        setScore(s.score);
        setTimeLeft(s.timeLeft);
        saveScore(s.score);
        setPhase('over');
    }, []);

    /* ── Start game ────────────────────────────────────────────── */
    const startGame = useCallback((lk) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const cfg = LEVELS[lk];
        const s = gs.current;
        Object.assign(s, {
            drops: [], feedbacks: [], speedMult: 1,
            lastTime: null, lastSpawn: 0,
            lives: 3, score: 0, input: '',
            levelKey: lk, phase: 'playing',
            timeLeft: cfg.timeLimit,
            lastSecond: performance.now(),
        });
        setLevelKey(lk);
        setScore(0); setLives(3); setInput('');
        setTimeLeft(cfg.timeLimit);
        setPhase('playing');
    }, []);

    /* ── Game loop ─────────────────────────────────────────────── */
    const loop = useCallback((ts) => {
        const s = gs.current;
        if (s.phase !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) { rafRef.current = requestAnimationFrame(loop); return; }

        if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        const ctx = canvas.getContext('2d');
        const cw = canvas.width;
        const ch = canvas.height;
        if (cw === 0 || ch === 0) { rafRef.current = requestAnimationFrame(loop); return; }

        // Delta time
        if (s.lastTime === null) { s.lastTime = ts; s.lastSecond = ts; }
        const dt = Math.min((ts - s.lastTime) / 1000, 0.05);
        s.lastTime = ts;

        // ── Countdown timer ──────────────────────────────────────
        const secElapsed = (ts - s.lastSecond) / 1000;
        if (secElapsed >= 1) {
            s.timeLeft = Math.max(0, s.timeLeft - Math.floor(secElapsed));
            s.lastSecond = ts - ((secElapsed % 1) * 1000); // carry remainder
            setTimeLeft(s.timeLeft);
            if (s.timeLeft <= 0) {
                // Draw one last frame then end
                drawSky(ctx, cw, ch, LEVELS[s.levelKey].sky);
                s.drops.forEach(d => drawDrop(ctx, d, cw, ch));
                s.feedbacks = drawFeedbacks(ctx, s.feedbacks, cw, ch);
                endGame('timeout');
                return;
            }
        }

        const cfg = LEVELS[s.levelKey];
        const spawnInt = Math.max(1100, cfg.spawnInterval - s.score * 0.15);
        const speed = cfg.speedPct * s.speedMult;

        // Spawn
        if (ts - s.lastSpawn > spawnInt) {
            s.drops.push(makeDrop(s.levelKey));
            s.lastSpawn = ts;
        }

        // Move & check missed
        let lostLife = false;
        s.drops = s.drops.map(d => ({ ...d, y: d.y + speed * dt }))
            .filter(d => { if (d.y > 96) { lostLife = true; return false; } return true; });

        if (lostLife) {
            s.lives -= 1;
            s.input = '';
            s.speedMult = Math.max(0.8, s.speedMult - 0.1);
            s.feedbacks.push({ text: '💥 Miss!', x: 50, y: 72, type: 'error', born: performance.now() });
            setLives(s.lives);
            setInput('');
            if (s.lives <= 0) {
                drawSky(ctx, cw, ch, cfg.sky);
                s.drops.forEach(d => drawDrop(ctx, d, cw, ch));
                s.feedbacks = drawFeedbacks(ctx, s.feedbacks, cw, ch);
                endGame('lives');
                return;
            }
        }

        drawSky(ctx, cw, ch, cfg.sky);
        s.drops.forEach(d => drawDrop(ctx, d, cw, ch));
        s.feedbacks = drawFeedbacks(ctx, s.feedbacks, cw, ch);

        rafRef.current = requestAnimationFrame(loop);
    }, [endGame]);

    useEffect(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (phase === 'playing') rafRef.current = requestAnimationFrame(loop);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [phase, loop]);

    /* ── Input ─────────────────────────────────────────────────── */
    const handleInput = useCallback((val) => {
        const s = gs.current;
        if (s.phase !== 'playing') return;
        if (val === 'clear') { s.input = ''; setInput(''); return; }
        if (val === 'back') { s.input = s.input.slice(0, -1); setInput(s.input); return; }
        s.input = (s.input + val).slice(-4);
        setInput(s.input);
        const num = parseInt(s.input);
        const idx = s.drops.findIndex(d => d.answer === num);
        if (idx !== -1) {
            const d = s.drops[idx];
            const pts = 100 + Math.floor(s.speedMult * 55);
            s.drops.splice(idx, 1);
            s.score += pts;
            s.speedMult = Math.min(s.speedMult + 0.015, 2.2);
            s.input = '';
            s.feedbacks.push({ text: `+${pts}`, x: d.x, y: d.y, type: 'success', born: performance.now() });
            setScore(s.score);
            setInput('');
        }
    }, []);

    useEffect(() => {
        const fn = (e) => {
            if (e.key >= '0' && e.key <= '9') handleInput(e.key);
            else if (e.key === 'Backspace') handleInput('back');
        };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [handleInput]);

    const goMenu = useCallback(() => {
        gs.current.phase = 'menu';
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setPhase('menu');
    }, []);

    /* ─── MENU ─────────────────────────────────────────────────── */
    if (phase === 'menu') {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1b2a,#0f2336,#0a2020)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI',sans-serif" }}>
                <style>{`@keyframes pulse { from { opacity:1; transform:scale(1); } to { opacity:0.7; transform:scale(1.15); } }`}</style>
                {onBack && (
                    <button onClick={onBack} style={{ position: 'fixed', top: 20, left: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 18px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ fontSize: 64, marginBottom: 12 }}>💧</div>
                    <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: -1, margin: 0 }}>Math Drops</h1>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>Beat the clock before lives run out</p>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Object.entries(LEVELS).map(([key, cfg]) => (
                        <button key={key} onClick={() => startGame(key)}
                            style={{ width: 200, padding: '28px 20px', background: `${cfg.color}15`, border: `2px solid ${cfg.color}40`, borderRadius: 28, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', color: '#fff', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: 36, marginBottom: 10 }}>{cfg.emoji}</div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: cfg.color, marginBottom: 4 }}>{cfg.label}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, marginBottom: 8 }}>{cfg.description}</div>
                            {/* Time badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                                ⏱ {cfg.timeLimit}s
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ─── GAME SCREEN ───────────────────────────────────────────── */
    const cfg = LEVELS[levelKey];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', fontFamily: "'Segoe UI',sans-serif", overflow: 'hidden', userSelect: 'none' }}>
            <style>{`
        @keyframes pulse { from { opacity:1; transform:scale(1); } to { opacity:0.7; transform:scale(1.2); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
      `}</style>

            {/* Canvas */}
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 0 }} />

            {/* HUD */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', zIndex: 10, background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

                {/* Menu btn */}
                <button onClick={goMenu} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 12, padding: '7px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ArrowLeft size={13} /> Menu
                </button>

                {/* Level badge */}
                <div style={{ padding: '5px 12px', borderRadius: 20, background: `${cfg.color}25`, border: `1px solid ${cfg.color}50`, fontSize: 12, fontWeight: 800, color: cfg.color }}>
                    {cfg.emoji} {cfg.label}
                </div>

                {/* Timer ring — centre piece */}
                <TimerRing timeLeft={timeLeft} timeLimit={cfg.timeLimit} color={cfg.color} />

                {/* Score */}
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '7px 14px', fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: 1 }}>
                    {score}
                </div>

                {/* Lives */}
                <div style={{ display: 'flex', gap: 3 }}>
                    {[0, 1, 2].map(i => (
                        <Heart key={i} size={18} fill={i < lives ? '#ef4444' : 'none'} color={i < lives ? '#ef4444' : 'rgba(255,255,255,0.25)'} />
                    ))}
                </div>
            </div>

            {/* Numpad */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: '#1b7188', borderRadius: '28px 28px 0 0', padding: '14px 14px 24px', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)' }}>
                <div style={{ background: '#a8e1ed', borderRadius: '14px 14px 0 0', padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 30, fontWeight: 900, color: '#1b7188', minHeight: 36, letterSpacing: 4 }}>
                        {input !== '' ? input : <span style={{ opacity: 0.3, fontSize: 20 }}>?</span>}
                    </div>
                    <button onClick={() => handleInput('back')} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(27,113,136,0.3)', background: 'transparent', color: '#1b7188', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} strokeWidth={3} />
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, maxWidth: 300, margin: '0 auto' }}>
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => (
                        <button key={n} onClick={() => handleInput(String(n))}
                            style={{ height: 58, background: '#175d71', border: 'none', borderBottom: '4px solid #124251', borderRadius: 14, color: '#65cbf0', fontSize: 22, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {n}
                        </button>
                    ))}
                    <div />
                    <button onClick={() => handleInput('0')} style={{ height: 58, background: '#175d71', border: 'none', borderBottom: '4px solid #124251', borderRadius: 14, color: '#65cbf0', fontSize: 22, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>0</button>
                    <button onClick={() => handleInput('clear')} style={{ height: 58, background: '#e05a5a', border: 'none', borderBottom: '4px solid #a03c3c', borderRadius: 14, color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>CLR</button>
                </div>
            </div>

            {/* Game Over overlay */}
            {phase === 'over' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 36, padding: '36px 32px', textAlign: 'center', width: 310, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
                        <div style={{ fontSize: 48, marginBottom: 6 }}>
                            {gs.current.timeLeft <= 0 ? '⏰' : '💧'}
                        </div>
                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#102a43', marginBottom: 4 }}>
                            {gs.current.timeLeft <= 0 ? "Time's Up!" : 'Game Over'}
                        </h2>
                        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                            {gs.current.timeLeft <= 0 ? 'The clock ran out!' : 'You ran out of lives!'}
                        </p>

                        {/* Score + time row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                            <div style={{ background: '#f0f4f8', borderRadius: 14, padding: 14, border: '1px solid #dde4ec' }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Score</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#1b7188' }}>{score}</div>
                            </div>
                            <div style={{ background: '#f0f4f8', borderRadius: 14, padding: 14, border: '1px solid #dde4ec' }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Time Left</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: timeLeft <= 0 ? '#ef4444' : '#f59e0b' }}>{timeLeft}s</div>
                            </div>
                        </div>

                        {score >= highScore && score > 0 && (
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>🏆 New High Score!</div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                            <button onClick={() => startGame(levelKey)} style={{ padding: 14, background: '#3bc8e7', border: 'none', borderBottom: '4px solid #1e617d', borderRadius: 16, color: '#fff', fontWeight: 900, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
                            <button onClick={goMenu} style={{ padding: 12, background: 'transparent', border: '2px solid #e5e7eb', borderRadius: 16, color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Change Level</button>
                            {onBack && <button onClick={onBack} style={{ padding: 10, background: 'transparent', border: 'none', color: '#9ca3af', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}