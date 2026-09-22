import React, { useState } from 'react';

const OfficeStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'Aadil@123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const metrics = {
    cpuTemp: '49.6°C',
    uptime: '1h 56m',
    ramUsage: '313Mi / 1.8Gi',
    diskUsage: '3.5G / 29G',
    status: 'Operational'
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff' }}>
        <form onSubmit={handleLogin} style={{ padding: '2rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          <h2>Admin Access</h2>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '8px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '8px' }} />
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', backgroundColor: '#0a0a0a', color: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#00ffcc', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>OfficePi Real-Time Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <StatusCard title="System Status" value={metrics.status} color="#00ffcc" />
        <StatusCard title="CPU Temperature" value={metrics.cpuTemp} />
        <StatusCard title="Uptime" value={metrics.uptime} />
        <StatusCard title="RAM Usage" value={metrics.ramUsage} />
        <StatusCard title="Disk Usage" value={metrics.diskUsage} />
      </div>
    </div>
  );
};

const StatusCard = ({ title, value, color = '#ffffff' }) => (
  <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${color}` }}>
    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#aaa' }}>{title}</h3>
    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
  </div>
);

export default OfficeStatus;
