import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Trophy, Users, Shield, Rocket, ArrowRight, Play } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div style={{ background: '#050510', color: '#fff', overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section style={{ 
                minHeight: '100vh', 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '0 24px'
            }}>
                <div style={{
                    position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.1), transparent 70%)',
                    zIndex: 0
                }} />
                
                <div style={{ maxWidth: '1000px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', borderRadius: '100px',
                            background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
                            color: '#22d3ee', fontSize: '12px', fontWeight: 700,
                            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '32px'
                        }}
                    >
                        <SparkleIcon /> The Future of Cognitive Performance
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        style={{ 
                            fontSize: 'clamp(48px, 8vw, 96px)', 
                            fontWeight: 900, 
                            lineHeight: 1, 
                            letterSpacing: '-0.04em',
                            marginBottom: '24px'
                        }}
                    >
                        Race to the Peak of <br />
                        <span style={{ 
                            background: 'linear-gradient(to right, #22d3ee, #a855f7, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Human Intelligence</span>
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={{ 
                            fontSize: '18px', 
                            color: 'rgba(255,255,255,0.6)', 
                            maxWidth: '600px', 
                            margin: '0 auto 48px',
                            lineHeight: 1.6
                        }}
                    >
                        BrainRace combines competitive gaming with neuroscientific training to help you master memory, focus, and speed.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <button 
                            onClick={onGetStarted}
                            className="btn-premium"
                            style={{ padding: '16px 36px', fontSize: '18px' }}
                        >
                            Start Training <ArrowRight size={20} />
                        </button>
                        <button 
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#fff', 
                                padding: '16px 36px', 
                                borderRadius: '12px',
                                fontSize: '18px',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            View Leaderboard
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '16px' }}>Engineered for Excellence</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Proprietary training modes developed for high-performance minds.</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <FeatureCard 
                            icon={<Zap color="#22d3ee" />} 
                            title="Neural Impulse"
                            desc="Reaction-based challenges that decrease cognitive latency and improve split-second decision making."
                        />
                        <FeatureCard 
                            icon={<Brain color="#a855f7" />} 
                            title="Memory Matrix"
                            desc="Expansion protocols for working memory, helping you process more complex information simultaneously."
                        />
                        <FeatureCard 
                            icon={<Trophy color="#fcd34d" />} 
                            title="Competitive Arena"
                            desc="Real-time matchmaking against global racers. Prove your cognitive dominance on the leaderboard."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -10 }}
        style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '40px',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)'
        }}
    >
        <div style={{ 
            width: '60px', height: '60px', borderRadius: '16px', 
            background: 'rgba(255,255,255,0.05)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px', fontSize: '28px'
        }}>{icon}</div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
);

const SparkleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 0L9.3033 5.6967L15 7.5L9.3033 9.3033L7.5 15L5.6967 9.3033L0 7.5L5.6967 5.6967L7.5 0Z" fill="currentColor"/>
    </svg>
);

export default LandingPage;
