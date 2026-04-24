import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE from '../config';

const TeacherDashboard = ({ user, onBack }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGames: 8,
        avgScore: 0,
        students: []
    });
    const [questions, setQuestions] = useState([]);
    const [showQuestionEditor, setShowQuestionEditor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [newQuestion, setNewQuestion] = useState({ 
        gameType: 'logic-flow', 
        questionText: '', 
        options: ['', '', '', ''],
        correctAnswer: '',
        difficulty: 'medium',
        points: 10 
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const userRes = await fetch(`${API_BASE}/api/admin/users`);
            const students = await userRes.json();
            
            const qRes = await fetch(`${API_BASE}/api/questions`);
            const qs = await qRes.json();
            setQuestions(qs);

            setStats({
                totalUsers: students.length,
                activeGames: 8,
                avgScore: Math.round(students.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / (students.length || 1)),
                students: students.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveQuestion = async () => {
        try {
            const method = editingQuestion ? 'PUT' : 'POST';
            const url = editingQuestion 
                ? `${API_BASE}/api/questions/${editingQuestion._id}` 
                : `${API_BASE}/api/questions`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newQuestion)
            });
            
            setNewQuestion({ 
                gameType: 'logic-flow', 
                questionText: '', 
                options: ['', '', '', ''],
                correctAnswer: '',
                difficulty: 'medium',
                points: 10 
            });
            setEditingQuestion(null);
            fetchData();
        } catch (err) {
            console.error("Save question error:", err);
        }
    };

    const handleDeleteQuestion = async (id) => {
        try {
            await fetch(`${API_BASE}/api/questions/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error("Delete question error:", err);
        }
    };

    const startEditing = (q) => {
        setEditingQuestion(q);
        setNewQuestion({
            gameType: q.gameType,
            questionText: q.questionText,
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty || 'medium',
            points: q.points || 10
        });
    };

    const cards = [
        { title: 'Total Students', value: stats.totalUsers, icon: '👨‍🎓', color: '#22d3ee' },
        { title: 'Avg. Points', value: stats.avgScore, icon: '📈', color: '#a855f7' },
        { title: 'Engaged Games', value: stats.activeGames, icon: '🎮', color: '#ec4899' },
        { title: 'Platform Status', value: 'Active', icon: '⚡', color: '#10b981' },
    ];

    if (showQuestionEditor) {
        return (
            <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Curriculum Manager 📝</h1>
                        <button onClick={() => { setShowQuestionEditor(false); setEditingQuestion(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}>Back to Dashboard</button>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '24px', color: editingQuestion ? '#a855f7' : '#22d3ee' }}>
                            {editingQuestion ? 'Edit Question' : 'Add New Question'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Game Type</label>
                                <select 
                                    value={newQuestion.gameType} 
                                    onChange={e => setNewQuestion({...newQuestion, gameType: e.target.value})}
                                    style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '8px' }}
                                >
                                    <option value="logic-flow">Logic Flow</option>
                                    <option value="memory-matrix">Memory Matrix</option>
                                    <option value="brain-buddy">Brain Buddy</option>
                                    <option value="math-dash">Math Dash</option>
                                </select>

                                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Question Text</label>
                                <input 
                                    placeholder="Question text..." 
                                    value={newQuestion.questionText}
                                    onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
                                    style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '8px' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Difficulty</label>
                                        <select 
                                            value={newQuestion.difficulty} 
                                            onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                                            style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '8px', width: '100%' }}
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Points</label>
                                        <input 
                                            type="number" 
                                            value={newQuestion.points}
                                            onChange={e => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                                            style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '8px', width: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Options (for Multiple Choice)</label>
                                {newQuestion.options.map((opt, i) => (
                                    <input 
                                        key={i}
                                        placeholder={`Option ${i+1}`}
                                        value={opt}
                                        onChange={e => {
                                            const opts = [...newQuestion.options];
                                            opts[i] = e.target.value;
                                            setNewQuestion({...newQuestion, options: opts});
                                        }}
                                        style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '8px' }}
                                    />
                                ))}
                                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Correct Answer</label>
                                <input 
                                    placeholder="Exact correct answer" 
                                    value={newQuestion.correctAnswer}
                                    onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                                    style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            {editingQuestion && (
                                <button 
                                    onClick={() => {
                                        setEditingQuestion(null);
                                        setNewQuestion({ gameType: 'logic-flow', questionText: '', options: ['', '', '', ''], correctAnswer: '', difficulty: 'medium', points: 10 });
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button 
                                onClick={handleSaveQuestion} 
                                style={{ background: editingQuestion ? '#a855f7' : '#22d3ee', border: 'none', color: editingQuestion ? '#fff' : '#000', padding: '12px 40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800 }}
                            >
                                {editingQuestion ? 'Update Question' : 'Add Question'}
                            </button>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Existing Questions ({questions.length})</h3>
                        <div style={{ marginTop: '20px' }}>
                            {questions.map(q => (
                                <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #222' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '10px', background: 'rgba(168,85,247,0.2)', color: '#a855f7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{q.gameType}</span>
                                            <span style={{ fontSize: '10px', background: 'rgba(34,211,238,0.2)', color: '#22d3ee', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{q.difficulty}</span>
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{q.questionText}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Ans: {q.correctAnswer} | {q.points} pts</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button onClick={() => startEditing(q)} style={{ color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Edit</button>
                                        <button onClick={() => handleDeleteQuestion(q._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Registered Students</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>STUDENT</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>TOTAL XP</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>GAMES</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>ROLE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.students.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '16px', fontWeight: 600 }}>{s.name}</td>
                                            <td style={{ padding: '16px', color: '#22d3ee', fontWeight: 800 }}>{s.totalScore || 0}</td>
                                            <td style={{ padding: '16px' }}>{s.gamesPlayed || 0}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    background: s.role === 'teacher' ? 'rgba(168,85,247,0.1)' : 'rgba(34,211,238,0.1)', 
                                                    color: s.role === 'teacher' ? '#a855f7' : '#22d3ee', 
                                                    padding: '4px 12px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 700 
                                                }}>{s.role}</span>
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
                        <button 
                            onClick={() => setShowQuestionEditor(true)}
                            style={{
                                background: '#a855f7',
                                color: '#fff',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(168,85,247,0.3)'
                            }}
                        >
                            Open Question Editor
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
