import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPages = ({ onAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Special case for Teacher Dashboard
        if (isLogin && !isOtpMode && email === 'mukulsharma22@gnu.ac.in' && password === 'Admin@1234') {
            setTimeout(() => {
                onAuth({ 
                    name: 'Mukul Sharma', 
                    email: 'mukulsharma22@gnu.ac.in', 
                    role: 'teacher',
                    score: 9999
                });
                setIsLoading(false);
            }, 1000);
            return;
        }

        const API_BASE = `http://${window.location.hostname}:3001/api`;
        try {
            if (isOtpMode && !otpSent) {
                // Request OTP logic
                const response = await fetch(`${API_BASE}/request-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (response.ok) {
                    setOtpSent(true);
                } else {
                    setError(data.error || 'Failed to send OTP');
                }
                return;
            }

            const endpoint = isOtpMode ? 'verify-otp' : (isLogin ? 'login' : 'signup');
            const payload = isOtpMode ? { email, otp } : (isLogin ? { email, password } : { name, email, password });

            const response = await fetch(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                if (isLogin || isOtpMode) {
                    onAuth(data);
                } else {
                    setIsLogin(true);
                    setPassword('');
                    setName('');
                    alert('Signup successful! Please login to continue.');
                }
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Could not connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: '🏎️', text: 'Race against friends in real-time' },
        { icon: '🧠', text: 'Train your brain with 1000+ questions' },
        { icon: '🏆', text: 'Climb global leaderboards' },
        { icon: '⚡', text: '6 unique game modes to master' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
            background: '#050510',
            overflow: 'hidden'
        }}>
            {/* Left Panel - Branding */}
            <div style={{
                display: 'none',
                width: '50%',
                background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0533 40%, #0d1a3a 100%)',
                position: 'relative',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '60px',
                boxSizing: 'border-box',
            }} className="auth-left-panel">
                {/* Animated background blobs */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '60vw', height: '60vw',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float1 8s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%',
                    width: '50vw', height: '50vw',
                    background: 'radial-gradient(circle, rgba(217,70,239,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float2 10s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', top: '30%', right: '-5%',
                    width: '30vw', height: '30vw',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float1 12s ease-in-out infinite reverse'
                }} />

                {/* Grid pattern overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
                        style={{
                            width: '90px', height: '90px',
                            background: 'linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)',
                            borderRadius: '24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '42px',
                            margin: '0 auto 24px',
                            boxShadow: '0 0 40px rgba(168,85,247,0.4)',
                            transform: 'rotate(6deg)',
                        }}
                    >
                        🏎️
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: '52px', fontWeight: 900,
                            background: 'linear-gradient(to right, #22d3ee, #ffffff, #d946ef)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-2px',
                            textTransform: 'uppercase', fontStyle: 'italic'
                        }}
                    >
                        BRAIN<br />RACE
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ color: 'rgba(34,211,238,0.7)', fontSize: '11px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '48px' }}
                    >
                        COGNITIVE RACING PLATFORM
                    </motion.p>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={{
                            width: '340px', height: '340px',
                            background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
                            borderRadius: '50%',
                            margin: '0 auto 40px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                            border: '1px solid rgba(34,211,238,0.15)',
                        }}
                    >
                        {/* Racer figures around the circle */}
                        <div style={{ fontSize: '80px', textAlign: 'center', lineHeight: 1 }}>
                            <div style={{ marginBottom: '-10px' }}>🏆</div>
                            <div>👾</div>
                        </div>
                        {/* Orbiting racers */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}
                        >
                            <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '36px' }}>🏎️</div>
                            <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '28px' }}>🤖</div>
                            <div style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: '32px' }}>⭐</div>
                            <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: '28px' }}>🧠</div>
                        </motion.div>
                    </motion.div>

                    {/* Feature List */}
                    <div style={{ textAlign: 'left', maxWidth: '320px', margin: '0 auto' }}>
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    marginBottom: '16px',
                                    padding: '14px 20px',
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <span style={{ fontSize: '22px' }}>{f.icon}</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.3px' }}>{f.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 24px',
                boxSizing: 'border-box',
                position: 'relative',
            }} className="auth-right-panel">
                {/* Background effects on right side */}
                <div style={{
                    position: 'absolute', top: '-10%', right: '-10%',
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float2 8s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', left: '-10%',
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float1 10s ease-in-out infinite'
                }} />

                <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        position: 'relative', zIndex: 10,
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '32px',
                        padding: '48px 40px',
                        width: '100%', maxWidth: '440px',
                        boxShadow: '0 0 80px rgba(217,70,239,0.1), 0 30px 60px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Mobile Logo (visible only on mobile) */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }} className="mobile-logo">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                            style={{
                                width: '72px', height: '72px',
                                background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
                                borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '34px', margin: '0 auto 16px',
                                boxShadow: '0 0 30px rgba(168,85,247,0.4)',
                                transform: 'rotate(4deg)'
                            }}
                        >
                            🏎️
                        </motion.div>
                        <h1 style={{
                            fontSize: '28px', fontWeight: 900,
                            background: 'linear-gradient(to right, #22d3ee, #ffffff, #d946ef)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            letterSpacing: '-1px', textTransform: 'uppercase', fontStyle: 'italic'
                        }}>BRAINRACE</h1>
                    </div>

                    {/* Tab switcher */}
                    <div style={{
                        display: 'flex', background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px', padding: '4px',
                        marginBottom: '32px', border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        {['Login', 'Sign Up'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => { 
                                    setIsLogin(i === 0); 
                                    setIsOtpMode(false); 
                                    setOtpSent(false);
                                    setOtp('');
                                    setError(''); 
                                }}
                                style={{
                                    flex: 1, padding: '12px 0',
                                    borderRadius: '12px', border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 800, fontSize: '13px', letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease',
                                    background: (i === 0 ? isLogin : !isLogin)
                                        ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))'
                                        : 'transparent',
                                    color: (i === 0 ? isLogin : !isLogin) ? '#fff' : 'rgba(255,255,255,0.35)',
                                    boxShadow: (i === 0 ? isLogin : !isLogin) ? '0 0 15px rgba(168,85,247,0.2)' : 'none',
                                    borderTop: (i === 0 ? isLogin : !isLogin) ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 style={{
                                fontSize: '26px', fontWeight: 900, color: '#fff',
                                marginBottom: '8px', letterSpacing: '-0.5px'
                            }}>
                                {isLogin ? 'Welcome Back!' : 'Join the Race!'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500, marginBottom: '28px' }}>
                                {isLogin ? 'Enter your credentials to continue racing' : 'Create your racer profile to get started'}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '16px' }}
                                >
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#d946ef', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                        Racer Name
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🏎️</span>
                                        <input
                                            type="text" required value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Speedy Racer"
                                            style={{
                                                width: '100%', padding: '14px 16px 14px 48px',
                                                background: 'rgba(0,0,0,0.4)',
                                                border: '2px solid rgba(255,255,255,0.06)',
                                                borderRadius: '14px', color: '#fff',
                                                fontSize: '15px', fontWeight: 500,
                                                outline: 'none', boxSizing: 'border-box',
                                                transition: 'border-color 0.3s',
                                                fontFamily: 'inherit'
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(217,70,239,0.5)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#22d3ee', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>✉️</span>
                                <input
                                    type="email" required value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={isOtpMode && otpSent}
                                    placeholder="racer@cosmos.com"
                                    style={{
                                        width: '100%', padding: '14px 16px 14px 48px',
                                        background: (isOtpMode && otpSent) ? 'rgba(34,211,238,0.05)' : 'rgba(0,0,0,0.4)',
                                        border: '2px solid rgba(255,255,255,0.06)',
                                        borderRadius: '14px', color: '#fff',
                                        fontSize: '15px', fontWeight: 500,
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.3s',
                                        fontFamily: 'inherit',
                                        opacity: (isOtpMode && otpSent) ? 0.6 : 1,
                                        cursor: (isOtpMode && otpSent) ? 'not-allowed' : 'text'
                                    }}
                                    onFocus={e => { if (!(isOtpMode && otpSent)) e.target.style.borderColor = 'rgba(34,211,238,0.5)'; }}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                />
                            </div>
                            {isOtpMode && otpSent && (
                                <p style={{ fontSize: '11px', color: '#22d3ee', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    ✅ OTP sent! Check your inbox (including spam).
                                </p>
                            )}
                        </div>

                        <AnimatePresence>
                            {!isOtpMode && (
                                <motion.div
                                    initial={{ opacity: 1, height: 'auto' }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '24px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#a855f7', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsOtpMode(true);
                                                setOtpSent(false);
                                                setOtp('');
                                                setError('');
                                            }}
                                            style={{ fontSize: '12px', color: 'rgba(217,70,239,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔒</span>
                                        <input
                                            type="password" required={!isOtpMode} value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            style={{
                                                width: '100%', padding: '14px 16px 14px 48px',
                                                background: 'rgba(0,0,0,0.4)',
                                                border: '2px solid rgba(255,255,255,0.06)',
                                                borderRadius: '14px', color: '#fff',
                                                fontSize: '15px', fontWeight: 500,
                                                outline: 'none', boxSizing: 'border-box',
                                                transition: 'border-color 0.3s',
                                                fontFamily: 'inherit'
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {isOtpMode && otpSent && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '24px' }}
                                >
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#fcd34d', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                        Enter OTP Code
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔢</span>
                                        <input
                                            type="text" required maxLength="6"
                                            value={otp} onChange={e => setOtp(e.target.value)}
                                            placeholder="XXXXXX"
                                            style={{
                                                width: '100%', padding: '14px 16px 14px 48px',
                                                background: 'rgba(0,0,0,0.4)',
                                                border: '2px solid rgba(252,211,77,0.3)',
                                                borderRadius: '14px', color: '#fff',
                                                fontSize: '24px', fontWeight: 900,
                                                letterSpacing: '8px', textAlign: 'center',
                                                outline: 'none', boxSizing: 'border-box',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', textAlign: 'center' }}>
                                        Didn't get it? <button type="button" onClick={() => setOtpSent(false)} style={{ color: '#fcd34d', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Resend</button>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isLogin && (
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOtpMode(!isOtpMode);
                                        setOtpSent(false);
                                        setOtp('');
                                        setError('');
                                    }}
                                    style={{
                                        fontSize: '12px', fontWeight: 700,
                                        color: isOtpMode ? '#a855f7' : '#22d3ee',
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '8px 16px', borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    {isOtpMode ? "← Use Password Instead" : "Login with OTP ✉️"}
                                </button>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '12px 16px', borderRadius: '12px',
                                    background: 'rgba(244,63,94,0.1)',
                                    border: '1px solid rgba(244,63,94,0.3)',
                                    color: '#fb7185', fontSize: '13px', fontWeight: 600,
                                    marginBottom: '16px', textAlign: 'center'
                                }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            type="submit"
                            style={{
                                width: '100%', padding: '16px',
                                background: isLoading
                                    ? 'rgba(168,85,247,0.3)'
                                    : 'linear-gradient(135deg, #d946ef, #a855f7 50%, #22d3ee)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px', color: '#fff',
                                fontSize: '15px', fontWeight: 900,
                                letterSpacing: '2px', textTransform: 'uppercase',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: isLoading ? 'none' : '0 0 30px rgba(217,70,239,0.35)',
                                transition: 'all 0.3s ease',
                                fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div style={{
                                        width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    Connecting...
                                </>
                            ) : (
                                <>{isOtpMode ? (otpSent ? "Verify & Enter 🏁" : "Send Me Code ✉️") : (isLogin ? "Let's Race! 🏁" : "Join the Race! 🚀")}</>
                            )}
                        </motion.button>
                    </form>

                    {/* Feature bullets (mobile) */}
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {features.map((f, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, lineHeight: 1.3 }}>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

                * { -webkit-font-smoothing: antialiased; }

                @keyframes float1 {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(25px) scale(0.97); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                input::placeholder { color: rgba(255,255,255,0.2); }
                input:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0 100px #0a0a2e inset !important;
                    -webkit-text-fill-color: #fff !important;
                }

                @media (min-width: 768px) {
                    .auth-left-panel { display: flex !important; }
                    .auth-right-panel { width: 50% !important; }
                    .mobile-logo { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default AuthPages;
