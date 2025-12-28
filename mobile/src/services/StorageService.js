import * as SecureStore from 'expo-secure-store';

const IP_HISTORY_KEY = 'ip_history';
const LAST_IP_KEY = 'last_connected_ip';

export const StorageService = {
    async saveIP(ip) {
        try {
            await SecureStore.setItemAsync(LAST_IP_KEY, ip);

            const history = await this.getIPHistory();
            if (!history.includes(ip)) {
                const newHistory = [ip, ...history.filter(i => i !== ip)].slice(0, 5);
                await SecureStore.setItemAsync(IP_HISTORY_KEY, JSON.stringify(newHistory));
            }
        } catch (error) {
            console.error('Error saving IP:', error);
        }
    },

    async getIPHistory() {
        try {
            const history = await SecureStore.getItemAsync(IP_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            return [];
        }
    },

    async getLastIP() {
        return await SecureStore.getItemAsync(LAST_IP_KEY);
    }
};
