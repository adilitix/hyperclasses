import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Users,
    Calendar,
    Ticket,
    LogOut,
    Settings,
    Activity,
    ChevronRight
} from 'lucide-react-native';
import { theme } from '../theme';
import { SocketService } from '../services/SocketService';

const DashboardScreen = ({ route, navigation }) => {
    const { user, serverUrl } = route.params;
    const [ticketCount, setTicketCount] = useState(5);

    useEffect(() => {
        const socket = SocketService.getSocket();
        if (socket) {
            socket.on('ticket_created', () => {
                setTicketCount(prev => prev + 1);
            });
        }
        return () => {
            if (socket) socket.off('ticket_created');
        };
    }, []);

    const handleLogout = () => {
        SocketService.disconnect();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Connect' }],
        });
    };

    const menuItems = [
        { title: 'Live Events', icon: Calendar, count: '3 Active', color: '#6366f1' },
        { title: 'Student Management', icon: Users, count: '124 Total', color: '#10b981' },
        { title: 'Support Tickets', icon: Ticket, count: `${ticketCount} New`, color: '#f59e0b' },
        { title: 'System Health', icon: Activity, count: 'Optimal', color: '#ec4899' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.username}>{user.username}</Text>
                </View>
                <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
                    <LogOut size={24} color={theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>12.4k</Text>
                        <Text style={styles.statLabel}>Lessons Taught</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>98%</Text>
                        <Text style={styles.statLabel}>Avg. Score</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Admin Control</Text>
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                                <item.icon size={28} color={item.color} />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuCount}>{item.count}</Text>
                            </View>
                            <ChevronRight size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.configButton}>
                    <Settings size={20} color={theme.colors.text} />
                    <Text style={styles.configButtonText}>Server Configuration</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.serverInfo}>Connected to: {serverUrl}</Text>
                    <Text style={styles.versionInfo}>HyperClass Admin Mobile v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
    },
    greeting: {
        fontSize: 14,
        color: theme.colors.textMuted,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    menuGrid: {
        gap: theme.spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    menuCount: {
        fontSize: 13,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    configButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    configButtonText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        marginTop: theme.spacing.xl * 2,
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    serverInfo: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    versionInfo: {
        color: theme.colors.textMuted,
        fontSize: 10,
        marginTop: 4,
        opacity: 0.5,
    },
});

export default DashboardScreen;
