import React, { useEffect, useState } from 'react';
import { useLandingTheme } from '../contexts/LandingThemeContext';

const TorchlightOverlay = () => {
    const { theme } = useLandingTheme();
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [radius, setRadius] = useState(150);

    useEffect(() => {
        if (theme !== 'black') return;

        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [theme]);

    if (theme !== 'black') return null;

    return (
        <>
            <div
                className="torchlight-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 99998,
                    background: `radial-gradient(
                        circle ${radius}px at ${mousePos.x}px ${mousePos.y}px,
                        transparent 0%,
                        rgba(0, 0, 0, 0.98) 80%,
                        rgba(0, 0, 0, 1) 100%
                    )`
                }}
            />
            {/* Torch Control Slider */}
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 99999,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                padding: '15px 20px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                color: 'white',
                minWidth: '200px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>
                    <span>TORCH BEAM</span>
                    <span>{radius}px</span>
                </div>
                <input
                    type="range"
                    min="50"
                    max="500"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        accentColor: '#fff',
                        height: '4px',
                        borderRadius: '2px'
                    }}
                />
                <div style={{ fontSize: '10px', opacity: 0.5, textAlign: 'center' }}>ADJUST FOCUS</div>
            </div>
        </>
    );
};

export default TorchlightOverlay;
