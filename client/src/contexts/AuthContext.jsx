import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage if available
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (username, password, role, eventId) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role, eventId })
            });
            const data = await res.json();
            if (data.success) {
                // Include eventId in the stored user data
                const userData = {
                    username: data.username,
                    role: data.role,
                    eventId: data.eventId, // Important: Student needs this to rejoin
                    eventName: data.eventName
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Clear anything else might be useful
        localStorage.removeItem('codeSnippets'); // Maybe keep snippets? Up to user.
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
