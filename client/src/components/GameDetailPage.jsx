import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, ChevronRight, Home } from 'lucide-react';

const GAME_INFO = {
    endless: {
        title: 'Endless Brain Race',
        category: 'Challenge Modes',
        categoryKey: 'challenge',
        icon: '🏎️',
        color: '#22d3ee',
        tagline: 'Race through infinite questions',
        shortDesc: 'In Endless Brain Race, you race through an infinite stream of trivia questions before your fuel runs out.',
        longDesc: 'Endless Brain Race pushes your general knowledge and recall speed to the limit. Every correct answer fuels your car — every wrong one costs time. How far can your brain take you before the tank runs empty?',
        skills: ['General Knowledge', 'Processing Speed', 'Recall'],
        levels: null,
        previewEmoji: ['🏎️', '⚡', '🏁'],
    },
    neon: {
        title: 'Neon Nexus',
        category: 'Attention',
        categoryKey: 'attention',
        icon: '🌌',
        color: '#d946ef',
        tagline: 'Click glowing tiles before they vanish',
        shortDesc: 'In Neon Nexus, you spot and tap glowing tiles before they disappear in a neon-lit grid.',
        longDesc: 'Neon Nexus trains your selective attention and visual processing. Tiles flash across a dark grid — blink and you miss them. This game measures how sharply your brain tracks fast-moving targets.',
        skills: ['Selective Attention', 'Visual Tracking', 'Reaction Speed'],
        levels: ['Easy', 'Medium', 'Hard'],
        previewEmoji: ['💜', '🟣', '✨'],
    },
    math: {
        title: 'Math Dash',
        category: 'Problem Solving',
        categoryKey: 'problem',
        icon: '⚡',
        color: '#6366f1',
        tagline: 'Solve math at lightning speed',
        shortDesc: 'In Math Dash, you solve rapid-fire math problems against the clock.',
        longDesc: 'Math Dash exercises your Arithmetic — a core part of Problem Solving skills. Quick mental calculations sharpen your ability to handle numbers under pressure, just like real-world decision-making scenarios.',
        skills: ['Arithmetic', 'Mental Math', 'Processing Speed'],
        levels: ['Easy', 'Medium', 'Hard'],
        previewEmoji: ['➕', '✖️', '🔢'],
    },
    word: {
        title: 'Logic Flow',
        category: 'Problem Solving',
        categoryKey: 'problem',
        icon: '🧬',
        color: '#f59e0b',
        tagline: 'Optimize neural processing with precision',
        shortDesc: 'In Logic Flow, you solve pattern-based logic puzzles to sharpen your reasoning.',
        longDesc: 'Logic Flow challenges your deductive reasoning and pattern recognition. Each puzzle is a neural workout — training the part of your brain responsible for structured thinking and problem decomposition.',
        skills: ['Logical Reasoning', 'Pattern Recognition', 'Working Memory'],
        levels: ['Beginner', 'Intermediate', 'Advanced'],
        previewEmoji: ['🧬', '🔷', '🧩'],
    },
    nature: {
        title: 'Neural Recall',
        category: 'Memory',
        categoryKey: 'memory',
        icon: '🧠',
        color: '#10b981',
        tagline: 'Expand your mental RAM',
        shortDesc: 'In Neural Recall, you quickly memorize tiles on a grid and reproduce their positions.',
        longDesc: 'Neural Recall trains your Spatial Recall — your ability to remember the location and arrangement of objects. This mirrors the memory skills used in navigation, chess, and spatial planning.',
        skills: ['Spatial Memory', 'Short-Term Memory', 'Recall Accuracy'],
        levels: ['3×3', '4×4', '5×5'],
        previewEmoji: ['🟩', '🟦', '🔲'],
    },
    color: {
        title: 'Color Match',
        category: 'Attention',
        categoryKey: 'attention',
        icon: '🎨',
        color: '#ec4899',
        tagline: 'Match colors and patterns at blazing speed',
        shortDesc: 'In Color Match, you rapidly match color-word pairs to train your cognitive flexibility.',
        longDesc: 'Color Match exercises your ability to suppress automatic responses and switch between rules. Inspired by the Stroop Effect, it trains the brain\'s conflict monitoring — a core executive function.',
        skills: ['Cognitive Flexibility', 'Inhibitory Control', 'Attention'],
        levels: ['Normal', 'Speed Mode', 'Expert'],
        previewEmoji: ['🔴', '🟢', '🔵'],
    },
    buddy: {
        title: 'Brain Buddy',
        category: 'Memory',
        categoryKey: 'memory',
        icon: '🦊',
        color: '#f97316',
        tagline: 'Visual animal quiz — biggest, fastest, cutest?',
        shortDesc: 'In Brain Buddy, you answer visual animal comparisons to train observational memory.',
        longDesc: 'Brain Buddy uses real animals and fun comparative questions to train your visual memory and semantic knowledge. Which animal is bigger? Faster? It\'s deceptively challenging as complexity grows.',
        skills: ['Visual Memory', 'Semantic Knowledge', 'Observation'],
        levels: null,
        previewEmoji: ['🦊', '🦁', '🐘'],
    },
    mathdrops: {
        title: 'Math Drops',
        category: 'Problem Solving',
        categoryKey: 'problem',
        icon: '💧',
        color: '#38bdf8',
        tagline: 'Solve falling calculations before they hit the ground',
        shortDesc: 'In Math Drops, equations rain down from the sky. Solve them on a calculator before they reach the bottom.',
        longDesc: 'Math Drops exercises Arithmetic — a core part of Problem Solving skills. Practice mental calculations under time pressure as falling raindrop equations demand your full focus. Difficulty ramps up with multiplication, division, and faster drops.',
        skills: ['Arithmetic', 'Mental Math', 'Problem Solving Under Pressure'],
        levels: ['Easy', 'Medium', 'Hard'],
        previewEmoji: ['💧', '🌧️', '🧮'],
    },
    multi: {
        title: 'Multiplayer',
        category: 'Challenge Modes',
        categoryKey: 'challenge',
        icon: '👥',
        color: '#ef4444',
        tagline: 'Face off against other racers in real-time',
        shortDesc: 'In Multiplayer, you race head-to-head against other players answering trivia questions.',
        longDesc: 'Multiplayer pits your brain directly against other players. Form teams, join rooms, and race through trivia together. Sharpen your speed — because your rival is answering right now.',
        skills: ['Competitive Recall', 'Speed', 'Teamwork'],
        levels: null,
        previewEmoji: ['👥', '🔴', '🔵'],
    },
};

const CATEGORY_PATH = {
    memory: 'Memory Games',
    attention: 'Attention Games',
    problem: 'Problem Solving',
    challenge: 'Challenge Modes',
};

const GamePreviewMock = ({ game }) => {
    const { color, previewEmoji, title } = game;

    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-end',
            flexShrink: 0,
        }}>
            {/* Tablet mock */}
            <motion.div
                initial={{ opacity: 0, y: 20, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: -4 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                    width: '180px',
                    height: '240px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '3px solid rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${color}20`,
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 60% 40%, ${color}20, transparent 70%)`,
                }} />
                <div style={{ fontSize: '56px', lineHeight: 1, position: 'relative', zIndex: 1 }}>{previewEmoji[0]}</div>
                <div style={{
                    fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '2px', textTransform: 'uppercase', position: 'relative', zIndex: 1
                }}>{title}</div>
                <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
                    {previewEmoji.slice(1).map((e, i) => (
                        <span key={i} style={{ fontSize: '24px' }}>{e}</span>
                    ))}
                </div>
                {/* Home button bar */}
                <div style={{
                    position: 'absolute', bottom: '8px',
                    width: '40px', height: '4px',
                    background: 'rgba(255,255,255,0.2)', borderRadius: '2px'
                }} />
            </motion.div>

            {/* Phone mock */}
            <motion.div
                initial={{ opacity: 0, y: 30, rotate: 3 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                style={{
                    width: '110px',
                    height: '190px',
                    background: 'rgba(255,255,255,0.09)',
                    border: '3px solid rgba(255,255,255,0.18)',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 30px ${color}15`,
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 40% 60%, ${color}25, transparent 70%)`,
                }} />
                {/* Notch */}
                <div style={{
                    position: 'absolute', top: '6px',
                    width: '30px', height: '4px',
                    background: 'rgba(255,255,255,0.15)', borderRadius: '2px'
                }} />
                <div style={{ fontSize: '36px', lineHeight: 1, position: 'relative', zIndex: 1 }}>{previewEmoji[0]}</div>
                <div style={{
                    width: '60px', height: '4px',
                    background: `${color}60`, borderRadius: '2px',
                    position: 'relative', zIndex: 1
                }} />
                <div style={{
                    fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '1.5px', textTransform: 'uppercase', position: 'relative', zIndex: 1
                }}>Play</div>
                {/* Home indicator */}
                <div style={{
                    position: 'absolute', bottom: '6px',
                    width: '28px', height: '3px',
                    background: 'rgba(255,255,255,0.2)', borderRadius: '2px'
                }} />
            </motion.div>
        </div>
    );
};

const GameDetailPage = ({ gameMode, onPlay, onBack }) => {
    const game = GAME_INFO[gameMode];
    if (!game) return null;

    const { title, category, categoryKey, icon, color, tagline, shortDesc, longDesc, skills, levels, previewEmoji } = game;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2336 40%, #0b1a2e 70%, #0a2020 100%)',
            color: '#fff',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            overflowX: 'hidden',
        }}>
            {/* Hero Section */}
            <div style={{
                paddingTop: '90px',
                paddingBottom: '60px',
                paddingLeft: 'clamp(24px, 5vw, 80px)',
                paddingRight: 'clamp(24px, 5vw, 80px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(32px, 6vw, 80px)',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Glow BG */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: `radial-gradient(ellipse at 80% 50%, ${color}18, transparent 60%)`,
                    pointerEvents: 'none',
                }} />

                {/* Device Mockups */}
                <GamePreviewMock game={game} />

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ flex: 1, minWidth: '280px' }}
                >
                    {/* Breadcrumb */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                        marginBottom: '24px', flexWrap: 'wrap',
                    }}>
                        <button onClick={onBack} style={{
                            background: 'none', border: 'none', color: color,
                            cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                            fontFamily: 'inherit', padding: 0
                        }}>Home</button>
                        <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                        <span style={{ color: color, fontWeight: 600 }}>Brain Games</span>
                        <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                        <span style={{ color: color, fontWeight: 600 }}>{CATEGORY_PATH[categoryKey]}</span>
                        <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                        <span>{title}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: 'clamp(36px, 5vw, 60px)',
                        fontWeight: 900, marginBottom: '20px',
                        letterSpacing: '-1.5px', lineHeight: 1.05,
                        color: '#fff',
                    }}>{title}</h1>

                    {/* Tagline */}
                    <p style={{
                        fontSize: '16px', fontWeight: 700,
                        color: 'rgba(255,255,255,0.85)',
                        marginBottom: '14px', lineHeight: 1.5
                    }}>{shortDesc}</p>

                    <p style={{
                        fontSize: '15px', fontWeight: 400,
                        color: 'rgba(255,255,255,0.55)',
                        marginBottom: '28px', lineHeight: 1.7,
                        maxWidth: '560px',
                    }}>{longDesc}</p>

                    {/* Levels row (if present) */}
                    {levels && (
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{
                                fontSize: '10px', fontWeight: 900,
                                color: 'rgba(255,255,255,0.35)',
                                letterSpacing: '3px', textTransform: 'uppercase',
                                marginBottom: '10px'
                            }}>Difficulty Levels</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {levels.map((lvl, i) => (
                                    <span key={i} style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        background: i === 0 ? `${color}25` : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${i === 0 ? color + '50' : 'rgba(255,255,255,0.1)'}`,
                                        fontSize: '12px', fontWeight: 700,
                                        color: i === 0 ? color : 'rgba(255,255,255,0.5)',
                                    }}>{lvl}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Play Now Button */}
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: `0 12px 40px ${color}50` }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onPlay}
                        style={{
                            padding: '16px 48px',
                            background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                            border: 'none', borderRadius: '50px',
                            color: '#fff', fontWeight: 900, fontSize: '18px',
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: `0 8px 32px ${color}40`,
                            transition: 'box-shadow 0.3s',
                        }}
                    >
                        <Play size={20} fill="#fff" />
                        Play Now
                    </motion.button>
                </motion.div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 clamp(24px,5vw,80px)' }} />

            {/* Skills Section */}
            <div style={{
                padding: 'clamp(40px, 6vw, 60px) clamp(24px, 5vw, 80px)',
                maxWidth: '900px',
            }}>
                <h2 style={{
                    fontSize: '22px', fontWeight: 900,
                    marginBottom: '12px', color: '#fff'
                }}>{title} Trains Your Brain With</h2>
                <p style={{
                    fontSize: '15px', color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.7, marginBottom: '24px', maxWidth: '620px'
                }}>
                    All Brain Games challenge specific cognitive skills. {title} focuses on {skills.join(', ')} — core abilities used in everyday problem-solving and learning.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {skills.map((s, i) => (
                        <div key={i} style={{
                            padding: '10px 20px',
                            background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                            border: `1px solid ${color}30`,
                            borderRadius: '20px',
                            fontSize: '13px', fontWeight: 700,
                            color: color,
                        }}>{s}</div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 clamp(24px,5vw,80px)' }} />

            {/* Explore other section */}
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: 'clamp(40px, 6vw, 60px) clamp(24px, 5vw, 80px)',
            }}>
                <h2 style={{
                    fontSize: '22px', fontWeight: 900,
                    marginBottom: '8px', color: '#fff'
                }}>Explore More Brain Games</h2>
                <p style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.35)',
                    marginBottom: '28px'
                }}>
                    Play games that challenge your short-term memory, attention, and problem solving.
                </p>
                <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onBack}
                    style={{
                        padding: '14px 32px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '50px',
                        color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '14px',
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to All Games
                </motion.button>
            </div>
        </div>
    );
};

export default GameDetailPage;
