import React from 'react';

const Logo = ({ size = 'medium', showText = true, textSub = 'ROBOTICS', className = '' }) => {
    // Sizes
    const iconWidth = size === 'small' ? 36 : size === 'large' ? 72 : 48;
    const iconHeight = size === 'small' ? 24 : size === 'large' ? 48 : 32;

    return (
        <div className={`adilitix-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', }}>
            {/* SVG Logo Icon matching exact Adilitix "A" circuit + "D" navy mark */}
            <svg
                width={iconWidth}
                height={iconHeight}
                viewBox="0 0 400 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <defs>
                    {/* Orange Circuit Gradient */}
                    <linearGradient id="adOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff6b00" />
                        <stop offset="50%" stopColor="#f95700" />
                        <stop offset="100%" stopColor="#d94800" />
                    </linearGradient>

                    {/* Navy Blue Gradient */}
                    <linearGradient id="adNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="40%" stopColor="#1d3b97" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Circuit Nodes & Traces extending left from 'A' */}
                <g stroke="url(#adOrangeGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                    {/* Top Trace */}
                    <path d="M 70 85 L 140 85" />
                    <circle cx="65" cy="85" r="12" fill="#0b0f17" stroke="url(#adOrangeGrad)" strokeWidth="10" />

                    {/* Middle Long Trace */}
                    <path d="M 40 130 L 105 130 L 145 95 L 160 95" />
                    <circle cx="35" cy="130" r="12" fill="#0b0f17" stroke="url(#adOrangeGrad)" strokeWidth="10" />

                    {/* Bottom Trace */}
                    <path d="M 45 175 L 115 175 L 130 150 L 150 150" />
                    <circle cx="40" cy="175" r="12" fill="#0b0f17" stroke="url(#adOrangeGrad)" strokeWidth="10" />

                    {/* Inner Node inside A */}
                    <circle cx="150" cy="115" r="7" fill="url(#adOrangeGrad)" stroke="none" />
                </g>

                {/* Main Slanted 'A' shape */}
                <path
                    d="M 195 25 
                       L 155 210 
                       L 70 228 
                       L 170 25 
                       Z"
                    fill="url(#adOrangeGrad)"
                />
                <path
                    d="M 190 25 
                       L 285 228 
                       L 230 228 
                       L 150 165 
                       L 215 165 
                       Z"
                    fill="url(#adOrangeGrad)"
                />
                <path
                    d="M 175 60 
                       L 215 140 
                       L 165 140 
                       Z"
                    fill="url(#adOrangeGrad)"
                />

                {/* Bold curved Navy Blue 'D' shape */}
                <path
                    d="M 205 25 
                       C 320 25, 360 80, 360 130 
                       C 360 185, 315 228, 235 228 
                       L 290 190 
                       C 320 180, 325 150, 325 130 
                       C 325 100, 290 65, 230 65 
                       Z"
                    fill="url(#adNavyGrad)"
                />
            </svg>

            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span style={{
                        fontSize: size === 'small' ? '1.1rem' : size === 'large' ? '2.1rem' : '1.5rem',
                        fontWeight: '900',
                        letterSpacing: '2px',
                        color: '#f8fafc',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>
                        ADILITIX
                    </span>
                    {textSub && (
                        <span style={{
                            fontSize: size === 'small' ? '0.55rem' : size === 'large' ? '0.85rem' : '0.68rem',
                            fontWeight: '700',
                            letterSpacing: '4px',
                            color: '#f97316',
                            textTransform: 'uppercase',
                            marginTop: '3px'
                        }}>
                            {textSub}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default Logo;
