import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import Logo from '../components/Logo';
import { BASE_URL, saveSession } from '../lib/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();

            if (data.success) {
                saveSession(data);
                navigate('/admin-dashboard');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch {
            setError('Server connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shop-page" style={{ display: 'flex', flexDirection: 'column' }}>
            <header className="site-header">
                <div className="container site-header-inner">
                    <Link to="/" aria-label="Adilitix Robotics home">
                        <Logo size="small" showText={true} textSub="ADMIN" />
                    </Link>
                    <Link to="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back to site</Link>
                </div>
            </header>

            <main className="registration-container" style={{ flex: 1 }}>
                <div className="registration-form-card" style={{ maxWidth: '400px' }}>
                    <div className="icon-tile"><Lock size={20} /></div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Admin sign in</h1>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: '6px 0 24px' }}>
                        For Adilitix Robotics staff only.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="admin-user">Username</label>
                            <input
                                id="admin-user"
                                type="text"
                                autoComplete="username"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="admin-pass">Password</label>
                            <input
                                id="admin-pass"
                                type="password"
                                autoComplete="current-password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                        </div>
                        {error && <p role="alert" className="form-error">{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminLogin;
