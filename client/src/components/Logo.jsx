import React from 'react';

const Logo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" /> {/* Blue */}
                <stop offset="100%" stopColor="#8b5cf6" /> {/* Purple */}
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Hexagon Shape */}
        <path
            d="M50 5 L93 25 V75 L50 95 L7 75 V25 Z"
            stroke="url(#grad1)"
            strokeWidth="5"
            fill="rgba(59, 130, 246, 0.1)"
            filter="url(#glow)"
        />

        {/* H Letter / Circuit Traces */}
        <path
            d="M35 35 V65 M65 35 V65 M35 50 H65"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
        />

        {/* Tech Nodes */}
        <circle cx="35" cy="35" r="3" fill="#3b82f6" />
        <circle cx="35" cy="65" r="3" fill="#8b5cf6" />
        <circle cx="65" cy="35" r="3" fill="#3b82f6" />
        <circle cx="65" cy="65" r="3" fill="#8b5cf6" />
    </svg>
);

export default Logo;
