import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const { login } = useAuth();
    const [role, setRole] = useState('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username, password, role);
        if (!res.success) {
            setError(res.message);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
        }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '350px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Workshop Portal</h1>

                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <button
                        className={`btn ${role === 'student' ? 'btn-primary' : ''}`}
                        style={{ flex: 1, background: role === 'student' ? '' : 'transparent' }}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button
                        className={`btn ${role === 'admin' ? 'btn-primary' : ''}`}
                        style={{ flex: 1, background: role === 'admin' ? '' : 'transparent' }}
                        onClick={() => setRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Username</label>
                        <input
                            type="text"
                            className="input-field"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {role === 'admin' && (
                        <div className="animate-fade-in">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {role === 'admin' ? 'Access Dashboard' : 'Join Session'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
