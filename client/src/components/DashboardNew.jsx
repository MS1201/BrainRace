import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Trophy, Zap, Star, Brain, Rocket, Sparkles, Gamepad2, Users, Medal, ArrowUpRight, ChevronRight, Activity } from 'lucide-react';

/* ─── Rank System ─────────────────────────────────────────────────────────── */
const RANKS = [
    { name: 'Beginner',   min: 0,     max: 499,     icon: '🌱', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    { name: 'Rookie',     min: 500,   max: 1499,    icon: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    { name: 'Racer',      min: 1500,  max: 3999,    icon: '🏎️', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
    { name: 'Champion',   min: 4000,  max: 9999,    icon: '🏆', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    { name: 'Legend',     min: 10000, max: 29999,   icon: '💫', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { name: 'Zen Master', min: 30000, max: Infinity, icon: '🧠', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
];
const getRank    = (s) => RANKS.find(r => s >= r.min && s <= r.max) || RANKS[0];
const getNextRank = (s) => { const i = RANKS.findIndex(r => s >= r.min && s <= r.max); return i < RANKS.length - 1 ? RANKS[i + 1] : null; };

/* ─── Animated Counter ────────────────────────────────────────────────────── */
const AnimCounter = ({ to, duration = 1.4 }) => {
    const [val, setVal] = useState(0);
    const ref = useRef();
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = Math.ceil(to / (duration * 60));
        const t = setInterval(() => {
            start = Math.min(start + step, to);
            setVal(start);
            if (start >= to) clearInterval(t);
        }, 1000 / 60);
        return () => clearInterval(t);
    }, [inView, to, duration]);
    return <span ref={ref}>{val.toLocaleString()}</span>;
};

/* ─── Game Definitions ────────────────────────────────────────────────────── */
const GAME_CATEGORIES = [
    {
        label: 'Memory',
        accent: '#10b981',
        games: [
            { title: 'Neural Recall',   badge: 'MEMORY',   desc: 'Expand your mental RAM in the memory matrix.',                        icon: '🧠', color: '#10b981', mode: 'nature'    },
            { title: 'Brain Buddy',     badge: 'NEW',       desc: 'Visual animal quiz — biggest, fastest, cutest?',                     icon: '🦊', color: '#f97316', mode: 'buddy', highlight: true },
        ]
    },
    {
        label: 'Attention',
        accent: '#d946ef',
        games: [
            { title: 'Neon Nexus',  badge: 'PREMIUM', desc: 'Click glowing tiles before they vanish. Neural speed test.', icon: '🌌', color: '#d946ef', mode: 'neon'  },
            { title: 'Color Match', badge: 'REFLEX',  desc: 'Match colors and patterns at blazing speed.',                icon: '🎨', color: '#ec4899', mode: 'color' },
        ]
    },
    {
        label: 'Problem Solving',
        accent: '#6366f1',
        games: [
            { title: 'Math Drops', badge: 'NEW',   desc: 'Solve falling equations under pressure.',              icon: '💧', color: '#38bdf8', mode: 'mathdrops', highlight: true },
            { title: 'Math Dash',  badge: 'SPEED', desc: 'Solve math at lightning speed before time runs out.', icon: '⚡', color: '#6366f1', mode: 'math'  },
            { title: 'Logic Flow', badge: 'LOGIC', desc: 'Precision calculation and neural processing.',         icon: '🧬', color: '#f59e0b', mode: 'word'  },
        ]
    },
    {
        label: 'Challenge Modes',
        accent: '#22d3ee',
        games: [
            { title: 'Endless Brain Race', badge: 'CLASSIC', desc: 'Race through infinite questions. Watch your fuel!', icon: '🏎️', color: '#22d3ee', mode: 'endless' },
            { title: 'Multiplayer',         badge: 'LIVE',    desc: 'Face off against other racers in real-time.',       icon: '👥', color: '#ef4444', mode: 'multi'   },
        ]
    },
];

/* ─── Main Dashboard ──────────────────────────────────────────────────────── */
const DashboardNew = ({ user, onSelectMode }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const score = user.totalScore || 0;
    const currentRank = getRank(score);
    const nextRank    = getNextRank(score);
    const progressPct = nextRank
        ? Math.min(100, ((score - currentRank.min) / (nextRank.min - currentRank.min)) * 100)
        : 100;

    useEffect(() => {
        fetch('http://localhost:3001/api/leaderboard')
            .then(r => r.json()).then(setLeaderboard).catch(() => {});
    }, []);

    return (
        <div className="dashboard-root">
            {/* ── Ambient blobs ── */}
            <div className="blob blob-cyan"  />
            <div className="blob blob-indigo"/>
            <div className="blob blob-purple"/>
            <div className="grid-overlay"    />

            <div className="dashboard-inner">

                {/* ══ HERO ══════════════════════════════════════════════════ */}
                <motion.section
                    className="hero"
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="hero-left">
                        <div className="pill-tag">
                            <span className="pill-dot" />
                            System Online
                        </div>
                        <h1 className="hero-title">
                            Welcome back,&nbsp;
                            <span className="highlight">{user.name}</span>
                        </h1>
                        <p className="hero-sub">
                            Race smarter. Think faster. Dominate the leaderboard.
                            Your brain is your fastest engine.
                        </p>
                        <motion.button
                            className="cta-btn"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <Play size={14} fill="currentColor" /> Play Now
                            <ArrowUpRight size={14} />
                        </motion.button>
                    </div>

                    {/* Rank card */}
                    <motion.div
                        className="rank-card"
                        style={{ '--rank-color': currentRank.color, background: currentRank.bg, borderColor: currentRank.color + '30' }}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="rank-icon">{currentRank.icon}</div>
                        <div className="rank-body">
                            <div className="rank-label">Current Rank</div>
                            <div className="rank-name" style={{ color: currentRank.color }}>{currentRank.name}</div>
                            {nextRank && (
                                <>
                                    <div className="rank-bar-track">
                                        <motion.div
                                            className="rank-bar-fill"
                                            style={{ background: currentRank.color, boxShadow: `0 0 10px ${currentRank.color}` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPct}%` }}
                                            transition={{ duration: 1.2, delay: 0.6 }}
                                        />
                                    </div>
                                    <div className="rank-hint">
                                        {(nextRank.min - score).toLocaleString()} pts to {nextRank.name} {nextRank.icon}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.section>

                {/* ══ KPI BAR ═══════════════════════════════════════════════ */}
                <section className="kpi-bar">
                    {[
                        { icon: <Trophy size={20} color="#f59e0b" />, label: 'Total XP',      value: score,                   suffix: '',    color: '#f59e0b' },
                        { icon: <Gamepad2 size={20} color="#a855f7"/>, label: 'Games Played',  value: user.gamesPlayed || 0,   suffix: '',    color: '#a855f7' },
                        { icon: <Medal size={20} color="#22d3ee"  />, label: 'Current Rank',  value: null, text: currentRank.name,          color: '#22d3ee' },
                        { icon: <Activity size={20} color="#4ade80"/>, label: 'Avg XP / Game', value: user.gamesPlayed ? Math.round(score / user.gamesPlayed) : 0, suffix: '', color: '#4ade80' },
                    ].map((k, i) => (
                        <motion.div
                            key={i} className="kpi-card"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i + 0.3 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="kpi-top">
                                {k.icon}
                                <div className="kpi-label">{k.label}</div>
                            </div>
                            <div className="kpi-value" style={{ color: k.color }}>
                                {k.text ?? <AnimCounter to={k.value} />}
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* ══ GAMES ═════════════════════════════════════════════════ */}
                <section id="games-section" className="games-section">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Mission Control</h2>
                            <p className="section-sub">Select your game mode and start training</p>
                        </div>
                        <div className="status-pill">
                            <span className="status-dot" />
                            All Systems Ready
                        </div>
                    </div>

                    {/* Category tabs */}
                    <div className="category-tabs">
                        <button
                            className={`cat-tab ${activeCategory === null ? 'active' : ''}`}
                            onClick={() => setActiveCategory(null)}
                        >All</button>
                        {GAME_CATEGORIES.map(c => (
                            <button
                                key={c.label}
                                className={`cat-tab ${activeCategory === c.label ? 'active' : ''}`}
                                style={activeCategory === c.label ? { '--tab-color': c.accent } : {}}
                                onClick={() => setActiveCategory(c.label)}
                            >{c.label}</button>
                        ))}
                    </div>

                    <div className="categories-stack">
                        {GAME_CATEGORIES.filter(c => activeCategory === null || c.label === activeCategory).map((cat, ci) => (
                            <div key={cat.label} className="category-block">
                                <div className="cat-label-row">
                                    <span className="cat-dot" style={{ background: cat.accent }} />
                                    <h3 className="cat-label">{cat.label}</h3>
                                </div>
                                <div className="games-grid">
                                    {cat.games.map((g, gi) => (
                                        <GameCard key={g.mode} game={g} delay={(ci * cat.games.length + gi) * 0.05} onPlay={onSelectMode} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ LEADERBOARD ═══════════════════════════════════════════ */}
                <section className="leaderboard-section">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Global Leaderboard</h2>
                            <p className="section-sub">Top racers competing for the crown</p>
                        </div>
                        <Trophy size={20} color="#f59e0b" />
                    </div>

                    {leaderboard.length === 0 ? (
                        <div className="lb-empty">No scores yet — be the first racer! 🏆</div>
                    ) : (
                        <div className="lb-list">
                            {leaderboard.slice(0, 10).map((entry, i) => (
                                <motion.div
                                    key={i} className={`lb-row ${i === 0 ? 'lb-gold' : i === 1 ? 'lb-silver' : i === 2 ? 'lb-bronze' : ''}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <div className="lb-rank">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="lb-num">#{i + 1}</span>}
                                    </div>
                                    <div className="lb-avatar">{entry.playerName?.[0]?.toUpperCase() || '?'}</div>
                                    <div className="lb-name">{entry.playerName}</div>
                                    <div className="lb-score">
                                        <Zap size={12} className="lb-zap" />
                                        {entry.score?.toLocaleString()} XP
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ══ ABOUT SECTION ═════════════════════════════════════════ */}
                <section id="about-section">
                    {/* Mission Card */}
                    <div className="about-grid">
                        <div style={{ position: 'relative' }}>
                            <motion.img
                                src="/about-hero.png"
                                style={{ width: '100%', borderRadius: '28px', boxShadow: '0 40px 100px -20px rgba(34,211,238,0.25)', display: 'block' }}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            />
                            <div style={{
                                position: 'absolute', bottom: '-18px', right: '-18px',
                                background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                                borderRadius: '22px', padding: '20px 24px',
                                boxShadow: '0 20px 40px rgba(34,211,238,0.35)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>10M+</div>
                                <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px' }}>Neurons Synced</div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Sparkles size={15} color="#22d3ee" />
                                <span style={{ fontSize: '11px', fontWeight: 900, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '4px' }}>Our Mission</span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1px', lineHeight: 1.1 }}>
                                The BrainRace Initiative:<br />
                                <span style={{ color: 'rgba(255,255,255,0.38)' }}>Evolving Cognitive Potential</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, marginBottom: '28px' }}>
                                BrainRace is more than just a collection of games. It's a high-performance cognitive training platform designed to push the boundaries of mental agility. By combining competitive mechanics with evidence-based training, we turn performance improvement into an exhilarating race.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { icon: <Zap size={22} color="#22d3ee" />, title: 'Neural Sync',   desc: 'AI-driven adaptive difficulty levels for maximum growth.' },
                                    { icon: <Trophy size={22} color="#f59e0b" />, title: 'Pro Rankings', desc: 'Climb from Beginner to Zen Master in the global arena.' },
                                ].map((f, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ marginBottom: '10px' }}>{f.icon}</div>
                                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', marginBottom: '4px' }}>{f.title}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.32)', lineHeight: 1.5 }}>{f.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* What are Brain Games */}
                    <div style={{ marginTop: '80px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Brain size={28} color="#22d3ee" />
                            <h2 className="section-title" style={{ marginBottom: 0 }}>What are Brain Games?</h2>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            padding: '36px', borderRadius: '28px',
                            color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '17px'
                        }}>
                            Brain games are like mini mental challenges — engaging activities designed to target areas like Memory, Attention, and Problem Solving. Many are based on tasks used in cognitive research and adapted to be fun, repeatable, and interactive. Whether you're at home, commuting, or taking a break, it's easy to fit in a quick mental challenge.
                        </div>
                    </div>

                    {/* Tips & FAQ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '52px', marginTop: '80px' }} className="tips-grid">
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.5px' }}>Tips to Get the Most Out of Brain Game Apps</h2>
                            <p style={{ color: 'rgba(255,255,255,0.48)', lineHeight: 1.8, fontSize: '15px' }}>
                                Start with short sessions — just 10 to 15 minutes a day is enough to build a habit. Start with games that match your interests. If the app adjusts to your level and gives feedback, it can help make the experience feel more personalized. And remember — good sleep, regular movement, and balanced nutrition all support your game performance too.
                            </p>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.5px' }}>Frequently Asked Questions</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { q: 'What are the best brain game apps?', a: 'For brain games that are structured and fun, Brain Race is a great pick — it\'s got a mix of memory, attention, and logic games.' },
                                    { q: 'How often should I play brain games?', a: '10–15 minutes a day, a few times a week. Short, focused sessions keep your training consistent and rewarding.' },
                                    { q: 'Are there free brain games?', a: 'Yes! Brain Race has free games you can try out without paying anything to get started.' },
                                    { q: 'Can children play brain games too?', a: 'Yes, there are brain games for kids — colorful, fun, and simple to understand, training focus and problem-solving.' },
                                ].map((faq, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '18px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontWeight: 800, color: '#fff', marginBottom: '6px', fontSize: '14px' }}>{faq.q}</div>
                                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>{faq.a}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Brain Games by BrainRace */}
                    <div style={{
                        marginTop: '80px',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.08))',
                        borderRadius: '36px', padding: '56px 48px',
                        border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, marginBottom: '16px' }}>Brain Games by Brain Race</h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', maxWidth: '840px', margin: '0 auto 44px', lineHeight: 1.65 }}>
                            Brain Race's games are developed by neuroscientists and designers who create engaging, interactive challenges based on established cognitive and neuropsychological tasks.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left' }}>
                            {[
                                { icon: '⭐', label: 'Research-Inspired Design', desc: 'Our games are based on principles from cognitive psychology and studies on how people think, focus, and problem-solve.' },
                                { icon: '👍', label: 'Personalized Training',    desc: 'Each game adjusts to your performance in real time — whether you\'re exploring puzzles or reaction-based challenges.' },
                                { icon: '🚀', label: 'Skill-Focused Challenges', desc: 'From memory tasks to logic puzzles, our games offer targeted practice in all key cognitive areas.' },
                            ].map((card, i) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '28px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '20px' }}>{card.icon}</span>
                                        <div style={{ fontWeight: 900, fontSize: '16px', color: '#fff' }}>{card.label}</div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{card.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ EDUCATIONAL (Why Brain Training) ═════════════════════ */}
                <section className="edu-section">
                    <div className="section-header" style={{ marginBottom: '48px' }}>
                        <div>
                            <h2 className="section-title">Why Brain Training Works</h2>
                            <p className="section-sub">Science-backed cognitive performance, made fun</p>
                        </div>
                    </div>

                    <div className="edu-grid">
                        {[
                            { icon: '🧠', color: '#22d3ee', title: 'Memory Training',     desc: 'Practice recall with repeatable pattern and sequence challenges that push your mental RAM.' },
                            { icon: '👁️', color: '#4ade80', title: 'Sustained Focus',     desc: 'Lock attention on moving targets and changing patterns. React before the window closes.' },
                            { icon: '⚡', color: '#f59e0b', title: 'Speed Thinking',      desc: 'High-pressure, fast-paced games sharpen split-second decision making under real cognitive load.' },
                            { icon: '🧩', color: '#a855f7', title: 'Problem Solving',     desc: 'Spot patterns, plan moves, and work through challenges step by step — satisfying to the core.' },
                            { icon: '💜', color: '#ec4899', title: 'Mental Reset',        desc: 'Short focused sessions help you recharge between meetings or after a demanding day.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i} className="edu-card"
                                style={{ '--edu-color': item.color }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -6 }}
                            >
                                <div className="edu-icon">{item.icon}</div>
                                <h3 className="edu-title">{item.title}</h3>
                                <p className="edu-desc">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ══ CTA BANNER ════════════════════════════════════════════ */}
                <motion.section
                    className="cta-banner"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="cta-banner-inner">
                        <Brain size={40} color="#22d3ee" style={{ opacity: 0.6 }} />
                        <div>
                            <h2 className="cta-banner-title">Ready to dominate?</h2>
                            <p className="cta-banner-sub">Jump into a game and start climbing the ranks.</p>
                        </div>
                        <motion.button
                            className="cta-btn cta-btn-large"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <Rocket size={16} /> Start Racing
                        </motion.button>
                    </div>
                </motion.section>

            </div>

            <style>{`
                /* ── Root ─────────────────────────────────────────────── */
                .dashboard-root {
                    min-height: 100vh;
                    background: #03030a;
                    color: #f8fafc;
                    padding: 108px 24px 80px;
                    box-sizing: border-box;
                    font-family: 'Outfit', 'Space Grotesk', system-ui, sans-serif;
                    position: relative;
                    overflow-x: hidden;
                }
                .dashboard-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    gap: 80px;
                }

                /* ── Ambient blobs ────────────────────────────────────── */
                .blob { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
                .blob-cyan   { width: 560px; height: 560px; top: -180px; left: -120px;  background: #22d3ee; opacity: 0.055; }
                .blob-indigo { width: 480px; height: 480px; bottom: -160px; right: -80px; background: #6366f1; opacity: 0.06;  }
                .blob-purple { width: 360px; height: 360px; top: 40%; left: 60%;        background: #a855f7; opacity: 0.04;  }
                .grid-overlay {
                    position: fixed; inset: 0; pointer-events: none; z-index: 0;
                    background-image:
                        linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px);
                    background-size: 48px 48px;
                }

                /* ── Hero ─────────────────────────────────────────────── */
                .hero {
                    display: flex;
                    align-items: center;
                    gap: 48px;
                    flex-wrap: wrap;
                }
                .hero-left { flex: 1; min-width: 280px; }
                .pill-tag {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 6px 14px; border-radius: 100px;
                    background: rgba(34,211,238,0.08);
                    border: 1px solid rgba(34,211,238,0.2);
                    font-size: 11px; font-weight: 800;
                    color: #22d3ee; letter-spacing: 3px; text-transform: uppercase;
                    margin-bottom: 20px;
                }
                .pill-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #22d3ee; box-shadow: 0 0 8px #22d3ee;
                    animation: blink 2s ease-in-out infinite;
                }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
                .hero-title {
                    font-size: clamp(38px, 6vw, 72px);
                    font-weight: 900; letter-spacing: -2px;
                    line-height: 1.06; margin-bottom: 16px;
                }
                .highlight { color: #22d3ee; text-shadow: 0 0 40px rgba(34,211,238,0.35); }
                .hero-sub {
                    font-size: 17px; color: rgba(255,255,255,0.42);
                    font-weight: 500; line-height: 1.65; max-width: 500px;
                    margin-bottom: 32px;
                }
                .cta-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 13px 28px; border-radius: 100px;
                    background: linear-gradient(135deg, #22d3ee, #6366f1);
                    color: #fff; font-weight: 800; font-size: 14px;
                    letter-spacing: 0.5px; cursor: pointer;
                    border: none; font-family: inherit;
                    box-shadow: 0 8px 32px rgba(34,211,238,0.25);
                    transition: opacity 0.2s;
                }
                .cta-btn:hover { opacity: 0.88; }
                .cta-btn-large { padding: 15px 36px; font-size: 15px; }

                /* ── Rank card ────────────────────────────────────────── */
                .rank-card {
                    flex: 0 0 340px; min-width: 280px;
                    border-radius: 28px; border: 1px solid;
                    padding: 32px 28px;
                    display: flex; gap: 20px; align-items: center;
                    backdrop-filter: blur(12px);
                }
                .rank-icon { font-size: 52px; line-height: 1; }
                .rank-body { flex: 1; }
                .rank-label {
                    font-size: 10px; font-weight: 800;
                    color: rgba(255,255,255,0.35); letter-spacing: 3px;
                    text-transform: uppercase; margin-bottom: 4px;
                }
                .rank-name { font-size: 28px; font-weight: 900; margin-bottom: 14px; }
                .rank-bar-track {
                    height: 6px; background: rgba(255,255,255,0.08);
                    border-radius: 4px; overflow: hidden; margin-bottom: 8px;
                }
                .rank-bar-fill { height: 100%; border-radius: 4px; }
                .rank-hint { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 600; }

                /* ── KPI Bar ──────────────────────────────────────────── */
                .kpi-bar {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }
                .kpi-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 22px; padding: 24px 22px;
                    backdrop-filter: blur(10px);
                    cursor: default;
                    transition: border-color 0.25s;
                }
                .kpi-card:hover { border-color: rgba(255,255,255,0.14); }
                .kpi-top {
                    display: flex; align-items: center; gap: 10px;
                    margin-bottom: 14px;
                }
                .kpi-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 1.5px; }
                .kpi-value { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1; }

                /* ── Games Section ────────────────────────────────────── */
                .games-section {}
                .section-header {
                    display: flex; align-items: flex-end;
                    justify-content: space-between; gap: 16px;
                    flex-wrap: wrap; margin-bottom: 32px;
                }
                .section-title { font-size: 36px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px; }
                .section-sub   { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 2px; text-transform: uppercase; }
                .status-pill {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 18px; border-radius: 100px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    font-size: 10px; font-weight: 800;
                    color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase;
                }
                .status-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #4ade80; box-shadow: 0 0 8px #4ade80;
                    animation: blink 1.8s ease-in-out infinite;
                }
                .category-tabs {
                    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px;
                }
                .cat-tab {
                    padding: 8px 20px; border-radius: 100px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.45); font-size: 13px;
                    font-weight: 700; cursor: pointer; font-family: inherit;
                    transition: all 0.2s;
                }
                .cat-tab:hover { background: rgba(255,255,255,0.07); color: #fff; }
                .cat-tab.active {
                    background: rgba(34,211,238,0.1);
                    border-color: rgba(34,211,238,0.35);
                    color: #22d3ee;
                }
                .categories-stack { display: flex; flex-direction: column; gap: 52px; }
                .category-block {}
                .cat-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
                .cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .cat-label { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
                .games-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(264px, 1fr));
                    gap: 18px;
                }

                /* ── Leaderboard ──────────────────────────────────────── */
                .leaderboard-section {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 32px; padding: 40px 36px;
                    backdrop-filter: blur(10px);
                }
                .lb-empty { text-align: center; padding: 40px 0; color: rgba(255,255,255,0.22); font-size: 14px; }
                .lb-list { display: flex; flex-direction: column; gap: 10px; }
                .lb-row {
                    display: flex; align-items: center; gap: 14px;
                    padding: 14px 18px; border-radius: 16px;
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: background 0.2s;
                }
                .lb-row:hover { background: rgba(255,255,255,0.045); }
                .lb-gold   { background: rgba(245,158,11,0.07); border-color: rgba(245,158,11,0.18); }
                .lb-silver { background: rgba(148,163,184,0.06); border-color: rgba(148,163,184,0.14); }
                .lb-bronze { background: rgba(180,100,50,0.06); border-color: rgba(180,100,50,0.14); }
                .lb-rank  { font-size: 20px; width: 32px; text-align: center; flex-shrink: 0; }
                .lb-num   { font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.35); }
                .lb-avatar {
                    width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
                    background: linear-gradient(135deg,#22d3ee33,#6366f133);
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; font-weight: 900; color: #22d3ee;
                }
                .lb-name  { flex: 1; font-weight: 700; font-size: 15px; color: rgba(255,255,255,0.85); }
                .lb-score {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 14px; font-weight: 900; color: #f59e0b;
                }
                .lb-zap   { color: #f59e0b; fill: #f59e0b; }

                /* ── Educational ──────────────────────────────────────── */
                .edu-section {}
                .edu-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                    gap: 18px;
                }
                .edu-card {
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 24px; padding: 28px 24px;
                    cursor: default;
                    transition: border-color 0.25s;
                }
                .edu-card:hover { border-color: color-mix(in srgb, var(--edu-color) 30%, transparent); }
                .edu-icon  { font-size: 28px; margin-bottom: 14px; }
                .edu-title { font-size: 17px; font-weight: 800; margin-bottom: 8px; color: #f8fafc; }
                .edu-desc  { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.6; }

                /* ── CTA Banner ───────────────────────────────────────── */
                .cta-banner {
                    background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08));
                    border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 32px; padding: 52px 48px;
                }
                .cta-banner-inner {
                    display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
                }
                .cta-banner-title { font-size: 34px; font-weight: 900; letter-spacing: -1px; margin-bottom: 6px; }
                .cta-banner-sub   { font-size: 15px; color: rgba(255,255,255,0.45); }
                .cta-banner-inner .cta-btn { margin-left: auto; white-space: nowrap; }

                /* ── About Section ────────────────────────────────────── */
                .about-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 60px;
                    align-items: center;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 36px;
                    padding: 56px;
                    backdrop-filter: blur(10px);
                }
                .tips-grid {}

                @media (max-width: 900px) {
                    .about-grid { grid-template-columns: 1fr; gap: 40px; padding: 36px; }
                    .tips-grid  { grid-template-columns: 1fr !important; gap: 40px !important; }
                }
                @media (max-width: 700px) {
                    .hero { gap: 32px; }
                    .rank-card { flex: unset; width: 100%; }
                    .cta-banner-inner { flex-direction: column; align-items: flex-start; }
                    .cta-banner-inner .cta-btn { margin-left: 0; }
                }
            `}</style>
        </div>
    );
};

/* ─── Game Card ───────────────────────────────────────────────────────────── */
const GameCard = ({ game, delay, onPlay }) => (
    <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -6, scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onPlay(game.mode)}
        style={{
            position: 'relative',
            textAlign: 'left',
            cursor: 'pointer',
            background: game.highlight
                ? `linear-gradient(145deg, ${game.color}18, ${game.color}06)`
                : `linear-gradient(145deg, ${game.color}0e, ${game.color}03)`,
            border: `1px solid ${game.highlight ? game.color + '35' : game.color + '18'}`,
            borderRadius: '28px',
            padding: '28px 24px',
            overflow: 'hidden',
            fontFamily: 'inherit',
            boxShadow: game.highlight ? `0 4px 30px ${game.color}12` : 'none',
            transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
    >
        {/* Top row: badge + icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <span style={{
                padding: '5px 12px', borderRadius: '100px',
                background: game.highlight ? game.color + '22' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${game.highlight ? game.color + '40' : 'rgba(255,255,255,0.08)'}`,
                fontSize: '10px', fontWeight: 900,
                color: game.highlight ? game.color : 'rgba(255,255,255,0.5)',
                letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>
                {game.badge}
            </span>
            <span style={{ fontSize: '44px', lineHeight: 1 }}>{game.icon}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {game.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, marginBottom: '22px' }}>
            {game.desc}
        </p>

        {/* Play CTA */}
        <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '11px', fontWeight: 800, color: game.color,
            letterSpacing: '2px', textTransform: 'uppercase',
        }}>
            <Play size={11} fill={game.color} /> Play Now
            <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
        </div>

        {/* Glow bottom line */}
        <div style={{
            position: 'absolute', bottom: 0, left: '10%', right: '10%',
            height: '1px',
            background: `linear-gradient(to right, transparent, ${game.color}55, transparent)`,
        }} />
    </motion.button>
);

/* ─── Stat Card (legacy, unused but kept for import safety) ─────────────── */
const StatCard = ({ icon, label, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        whileHover={{ y: -4 }}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px 20px', backdropFilter: 'blur(10px)' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {icon}
            <div style={{ width: '40px', height: '3px', background: `${color}30`, borderRadius: '2px' }} />
        </div>
        <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '26px', fontWeight: 900 }}>{value}</div>
    </motion.div>
);

export default DashboardNew;
