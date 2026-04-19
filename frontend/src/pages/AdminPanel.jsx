import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Settings, Play, Users, Landmark, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [charities, setCharities] = useState([]);
    const [charityName, setCharityName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, charitiesRes] = await Promise.all([
                client.get('/admin/stats'),
                client.get('/admin/users'),
                client.get('/charity/')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setCharities(charitiesRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const runDraw = async () => {
        if (!confirm('Run monthly draw now?')) return;
        try {
            await client.post('/draw/run');
            alert('Draw completed successfully!');
            fetchData();
        } catch (err) {
            alert('Error running draw');
        }
    };

    const addCharity = async (e) => {
        e.preventDefault();
        try {
            await client.post('/admin/charities', { name: charityName, description: 'Hero support foundation' });
            setCharityName('');
            alert('Charity added!');
            fetchData();
        } catch (err) {
            alert('Error adding charity');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="container" style={{ paddingTop: '40px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate('/dashboard')}
                        style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '32px' }}>Admin Nexus</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Platform control and engine management.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={runDraw} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Play size={16} /> Run Monthly Draw
                    </button>
                    <button className="btn btn-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="card glass">
                    <Users size={20} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>{stats?.total_users || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Registered</div>
                </div>
                <div className="card glass">
                    <Settings size={20} color="var(--accent)" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>{stats?.active_users || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active Subscriptions</div>
                </div>
                <div className="card glass">
                    <Play size={20} color="var(--secondary)" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>{stats?.total_draws || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Draws Conducted</div>
                </div>
                <div className="card glass">
                    <Landmark size={20} color="#f59e0b" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>${stats?.total_charity_contributions || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Charity Impact Pool</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '20px' }}>User Directory</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                <th style={{ paddingBottom: '12px' }}>Email</th>
                                <th style={{ paddingBottom: '12px' }}>Status</th>
                                <th style={{ paddingBottom: '12px' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ padding: '12px 0' }}>{u.email}</td>
                                    <td style={{ padding: '12px 0' }}>
                                        <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: u.subscription_status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: u.subscription_status === 'active' ? 'var(--accent)' : 'var(--error)' }}>
                                            {u.subscription_status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card glass">
                    <h3 style={{ marginBottom: '20px' }}>Manage Charities</h3>
                    <form onSubmit={addCharity} style={{ marginBottom: '24px' }}>
                        <input
                            className="glass"
                            type="text"
                            placeholder="Charity Name"
                            value={charityName}
                            onChange={e => setCharityName(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '16px' }}
                        />
                        <button className="btn btn-outline" style={{ width: '100%' }}>Add New Charity</button>
                    </form>

                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>Current Charities</h4>
                        {charities.length === 0 ? <p style={{ fontSize: '14px' }}>No charities added yet.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {charities.map(c => (
                                    <li key={c.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', fontSize: '14px' }}>
                                        {c.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
