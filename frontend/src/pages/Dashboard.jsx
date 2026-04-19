import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Plus, Trophy, Heart, CreditCard, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [scores, setScores] = useState([]);
    const [draw, setDraw] = useState(null);
    const [charities, setCharities] = useState([]);
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [newScore, setNewScore] = useState({ score: '', date: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [scoresRes, drawRes, charitiesRes, myCharityRes] = await Promise.all([
                client.get('/scores/').catch(() => ({ data: [] })),
                client.get('/draw/latest').catch(() => ({ data: null })),
                client.get('/charity/').catch(() => ({ data: [] })),
                client.get('/charity/me').catch(() => ({ data: null }))
            ]);
            setScores(scoresRes.data || []);
            setDraw(drawRes.data);
            setCharities(charitiesRes.data || []);
            setSelectedCharity(myCharityRes.data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const addScore = async (e) => {
        e.preventDefault();
        if (!newScore.score || !newScore.date) {
            alert('Please enter both score and date');
            return;
        }

        const scoreVal = parseInt(newScore.score);
        if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
            alert('Score must be a number between 1 and 45');
            return;
        }

        try {
            await client.post('/scores/', { score: scoreVal, date: newScore.date });
            setNewScore({ score: '', date: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Error adding score');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleCharitySelect = async (id) => {
        try {
            await client.post('/charity/select', { charity_id: id, percentage: 10 });
            fetchData();
        } catch (err) {
            alert('Error selecting charity');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px' }}>Hero Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Welcome back, <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{user?.email}</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {user?.is_admin && (
                        <button className="btn btn-outline" onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} /> Admin Nexus
                        </button>
                    )}
                    <button className="btn btn-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Subscription Block */}
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <CreditCard size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '18px' }}>Subscription</h3>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>ACTIVE</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>Next renewal: May 18, 2026</p>
                </div>

                {/* Latest Draw Block */}
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Trophy size={20} color="var(--secondary)" />
                        <h3 style={{ fontSize: '18px' }}>Monthly Draw</h3>
                    </div>
                    {draw ? (
                        <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                {draw.numbers.map((n, i) => (
                                    <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700' }}>{n}</div>
                                ))}
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Latest draw from {new Date(draw.created_at).toLocaleDateString()}</p>
                        </div>
                    ) : <p>No draws yet.</p>}
                </div>

                {/* Charity Block */}
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Heart size={20} color="#f43f5e" />
                        <h3 style={{ fontSize: '18px' }}>Charity Impact</h3>
                    </div>
                    {selectedCharity ? (
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>
                                {charities.find(c => c.id === selectedCharity.charity_id)?.name}
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Contributing {selectedCharity.percentage}% of subscription.
                            </p>
                            <button
                                onClick={() => setSelectedCharity(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', marginTop: '12px', padding: 0 }}
                            >
                                Change Charity
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>Choose your cause:</p>
                            <select
                                className="glass"
                                onChange={(e) => handleCharitySelect(e.target.value)}
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }}
                                defaultValue=""
                            >
                                <option value="" disabled style={{ background: '#1e293b' }}>Select a charity...</option>
                                {charities.map(c => (
                                    <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Score Entry */}
                <div className="card glass">
                    <h3 style={{ marginBottom: '20px' }}>Add Latest Score</h3>
                    <form onSubmit={addScore}>
                        <div style={{ marginBottom: '16px' }}>
                            <input
                                className="glass"
                                type="number"
                                placeholder="Score (1-45)"
                                value={newScore.score}
                                onChange={e => setNewScore({ ...newScore, score: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                className="glass"
                                type="date"
                                value={newScore.date}
                                onChange={e => setNewScore({ ...newScore, date: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', borderRadius: '8px' }}
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Add Score</button>
                    </form>
                </div>

                {/* Score List */}
                <div className="card glass">
                    <h3 style={{ marginBottom: '20px' }}>Your Last 5 Scores</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <th style={{ paddingBottom: '12px' }}>Date</th>
                                <th style={{ paddingBottom: '12px' }}>Score</th>
                                <th style={{ paddingBottom: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px 0' }}>{s.date}</td>
                                    <td style={{ padding: '16px 0', fontWeight: '700' }}>{s.score}</td>
                                    <td style={{ padding: '16px 0' }}>
                                        <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent)' }}>Verified</span>
                                    </td>
                                </tr>
                            ))}
                            {scores.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No scores entered yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
