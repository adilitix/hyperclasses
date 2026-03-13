import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Server, History, ArrowRight, X } from 'lucide-react-native';
import { theme } from '../theme';
import { StorageService } from '../services/StorageService';

const ConnectScreen = ({ navigation }) => {
    const [ip, setIp] = useState('');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const savedHistory = await StorageService.getIPHistory();
        setHistory(savedHistory);
        const lastIp = await StorageService.getLastIP();
        if (lastIp) setIp(lastIp);
    };

    const handleConnect = async (selectedIp) => {
        const targetIp = selectedIp || ip;
        if (!targetIp) {
            setError('Please enter a server IP or URL');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Basic formatting
            let formattedUrl = targetIp.trim();
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = `http://${formattedUrl}`;
            }

            // For now, we'll just save it and move to login
            // In a real app, we might want to check /api/health
            await StorageService.saveIP(formattedUrl);

            navigation.navigate('Login', { serverUrl: formattedUrl });
        } catch (err) {
            setError('Failed to save connection details');
        } finally {
            setIsLoading(false);
        }
    };

    const renderHistoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.historyItem}
            onPress={() => handleConnect(item)}
        >
            <History size={20} color={theme.colors.textMuted} />
            <Text style={styles.historyText}>{item}</Text>
            <ArrowRight size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Server size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.title}>Connect to Server</Text>
                    <Text style={styles.subtitle}>Enter the backend IP address to get started</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 192.168.1.10:5000"
                        placeholderTextColor={theme.colors.textMuted}
                        value={ip}
                        onChangeText={(text) => {
                            setIp(text);
                            setError('');
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {ip.length > 0 && (
                        <TouchableOpacity onPress={() => setIp('')} style={styles.clearButton}>
                            <X size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleConnect()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.connectButtonText}>Connect</Text>
                            <ArrowRight size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                {history.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>Recent Connections</Text>
                        <FlatList
                            data={history}
                            renderItem={renderHistoryItem}
                            keyExtractor={(item) => item}
                            scrollEnabled={false}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl * 2,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    inputContainer: {
        position: 'relative',
        marginBottom: theme.spacing.md,
    },
    input: {
        backgroundColor: theme.colors.inputBg,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    clearButton: {
        position: 'absolute',
        right: theme.spacing.md,
        top: '50%',
        transform: [{ translateY: -9 }],
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    connectButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    historySection: {
        marginTop: theme.spacing.xl * 2,
    },
    historyTitle: {
        color: theme.colors.textMuted,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.md,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    historyText: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
    },
});

export default ConnectScreen;
