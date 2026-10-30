// Shared API base + admin session handling for the Adilitix site.

const rawBase = import.meta.env.VITE_SERVER_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
export const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

const KEYS = ['adilitix_token', 'adilitix_admin', 'adilitix_username', 'adilitix_role', 'adilitix_permissions'];

export function getToken() {
    try { return localStorage.getItem('adilitix_token'); } catch { return null; }
}

export function saveSession(data) {
    localStorage.setItem('adilitix_token', data.token);
    localStorage.setItem('adilitix_admin', 'true');
    localStorage.setItem('adilitix_username', data.username);
    localStorage.setItem('adilitix_role', data.role);
    if (data.permissions) {
        localStorage.setItem('adilitix_permissions', JSON.stringify(data.permissions));
    } else {
        localStorage.removeItem('adilitix_permissions');
    }
}

export function clearSession() {
    try { KEYS.forEach(k => localStorage.removeItem(k)); } catch { /* storage unavailable */ }
}

// Adds the admin token to every request made to our API, and sends the user back to the
// login page when the server says the session is no longer valid.
export function installAuthFetch() {
    if (window.__adilitixFetchInstalled) return;
    window.__adilitixFetchInstalled = true;
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input.url;
        const isApi = url.startsWith(`${BASE_URL}/api/`) || url.startsWith('/api/');
        const token = getToken();
        if (isApi && token) {
            const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
            if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
            init = { ...init, headers };
        }
        const res = await nativeFetch(input, init);
        if (isApi && token && res.status === 401 && !url.includes('/auth/')) {
            clearSession();
            if (window.location.pathname.includes('admin-dashboard')) {
                window.location.assign(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/admin-login`);
            }
        }
        return res;
    };
}
