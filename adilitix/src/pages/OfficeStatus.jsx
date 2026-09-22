import React, { useState, useEffect } from 'react';

const OfficeStatus = () => {
  const [metrics, setMetrics] = useState({
    cpuTemp: '49.6°C',
    uptime: '1h 56m',
    ramUsage: '313Mi / 1.8Gi',
    diskUsage: '3.5G / 29G',
    status: 'Operational'
  });

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Inter, sans-serif', 
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      minHeight: '100vh' 
    }}>
      <h1 style={{ color: '#00ffcc', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>OfficePi Real-Time Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <StatusCard title="System Status" value={metrics.status} color="#00ffcc" />
        <StatusCard title="CPU Temperature" value={metrics.cpuTemp} />
        <StatusCard title="Uptime" value={metrics.uptime} />
        <StatusCard title="RAM Usage" value={metrics.ramUsage} />
        <StatusCard title="Disk Usage" value={metrics.diskUsage} />
      </div>

      <div style={{ marginTop: '3rem', backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
        <h2>Live Logs</h2>
        <p style={{ color: '#888' }}>Gemini and WhatsApp activity logs will be synced here.</p>
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
