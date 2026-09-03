import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { apiConfig } from './apiConfig';

// Reverb speaks the Pusher protocol, so the standard Pusher JS client is the
// transport. We don't hardcode a separate host/port for it — it rides the
// same origin as the API (Caddy proxies both `/api/*` and the WebSocket
// upgrade at `/app/*` from one address), so whatever VITE_API_BASE_URL
// points at is also where the socket connects.
const apiUrl = new URL(apiConfig.baseUrl, window.location.origin);
const isSecure = apiUrl.protocol === 'https:';
const wsPort = Number(apiUrl.port) || (isSecure ? 443 : 80);

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Lazily-created singleton Echo client. Only created when something actually
 * subscribes (see useTicketRealtime) — screens that never touch tickets
 * (Login, Admin) never open a socket.
 */
export const getEcho = (): Echo<'reverb'> => {
    if (!echoInstance) {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: apiUrl.hostname,
            wsPort,
            wssPort: wsPort,
            forceTLS: isSecure,
            enabledTransports: isSecure ? ['ws', 'wss'] : ['ws'],
            Pusher,
        });
    }

    return echoInstance;
};
