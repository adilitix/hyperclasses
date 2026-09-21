import React, { useState, useEffect } from 'react';

const OfficeStatus = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // In a real scenario, this would fetch from an API endpoint
    // For now, it displays static mock data or I can wire it to an API later
    setMetrics({
      status: 'Online',
      cpuTemp: '44.3°C',
      uptime: '4h 8m',
      lastUpdate: new Date().toLocaleTimeString()
    });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>OfficePi Status</h1>
      {metrics ? (
        <ul>
          <li>Status: {metrics.status}</li>
          <li>CPU Temp: {metrics.cpuTemp}</li>
          <li>Uptime: {metrics.uptime}</li>
          <li>Last Updated: {metrics.lastUpdate}</li>
        </ul>
      ) : (
        <p>Loading metrics...</p>
      )}
    </div>
  );
};

export default OfficeStatus;
