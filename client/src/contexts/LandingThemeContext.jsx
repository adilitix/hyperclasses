import React, { createContext, useContext, useState, useEffect } from 'react';

const LandingThemeContext = createContext();

export const useLandingTheme = () => {
    const context = useContext(LandingThemeContext);
    if (!context) return { theme: 'dark', setTheme: () => { } };
    return context;
};

export const LandingThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('landing-theme') || 'dark');

    useEffect(() => {
        localStorage.setItem('landing-theme', theme);
        document.documentElement.setAttribute('data-landing-theme', theme);
    }, [theme]);

    return (
        <LandingThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </LandingThemeContext.Provider>
    );
};
