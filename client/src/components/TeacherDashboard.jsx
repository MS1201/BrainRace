import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TeacherDashboard = ({ user, onBack }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGames: 8,
        avgScore: 0,
        recentSignups: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch some real data from backend to make it look active
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`http://${window.location.hostname}:3001/api/leaderboard`);
                const leaderboard = await response.json();
                
                // Simulate some teacher stats
                setStats({
                    totalUsers: leaderboard.length,
                    activeGames: 8,
                    avgScore: Math.round(leaderboard.reduce((acc, curr) => acc + (curr.score || 0), 0) / (leaderboard.length || 1)),
                    recentSignups: leaderboard.slice(0, 5)
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const cards = [
        { title: 'Total Students', value: stats.totalUsers, icon: '👨‍🎓', color: '#22d3ee' },
        { title: 'Avg. Points', value: stats.avgScore, icon: '📈', color: '#a855f7' },
        { title: 'Engaged Games', value: stats.activeGames, icon: '🎮', color: '#ec4899' },
        { title: 'Platform Status', value: 'Active', icon: '⚡', color: '#10b981' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050510',
            color: '#fff',
            padding: '40px 24px',
            fontFamily: "'Outfit', sans-serif"
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}
                        >
                            Teacher Control Center 🛠️
                        </motion.h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                            Welcome back, Admin. Managing BrainRace platform.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Switch to Student View
                    </motion.button>
                </div>

                {/* Grid Stats */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '24px',
                    marginBottom: '40px'
                }}>
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px',
                                padding: '24px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ 
                                position: 'absolute', top: '-10px', right: '-10px', 
                                fontSize: '64px', opacity: 0.1 
                            }}>{card.icon}</div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                {card.title}
                            </p>
                            <h2 style={{ fontSize: '36px', fontWeight: 900, color: card.color }}>
                                {loading ? '...' : card.value}
                            </h2>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Performance Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '24px',
                            padding: '32px'
                        }}
                    >
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Top Performing Students</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>STUDENT</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>SCORE</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>LEVEL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentSignups.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '16px', fontWeight: 600 }}>{s.name}</td>
                                            <td style={{ padding: '16px', color: '#22d3ee', fontWeight: 800 }}>{s.score}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    background: 'rgba(34,211,238,0.1)', 
                                                    color: '#22d3ee', 
                                                    padding: '4px 12px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 700 
                                                }}>Level {Math.floor(s.score / 100) + 1}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Quick Launch */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
                            border: '1px solid rgba(168,85,247,0.2)',
                            borderRadius: '24px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Curriculum Manager</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                            Update game questions, difficulty levels, and time constraints for all students.
                        </p>
                        <button style={{
                            background: '#a855f7',
                            color: '#fff',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(168,85,247,0.3)'
                        }}>
                            Open Question Editor
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
