import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/Login';
import Layout from './components/Layout';

function AppContent() {
    const { user } = useAuth();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [user]);

    return user ? <Layout /> : <Login />;
}

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <AppContent />
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
