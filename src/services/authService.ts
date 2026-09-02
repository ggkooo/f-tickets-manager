import { type AuthSessionData } from '../auth/session';
import type { LocationSlug } from '../locations';
import { apiConfig, buildApiUrl } from './apiConfig';

const LOGIN_PATH = '/login';
const DEFAULT_ERROR_MESSAGE = 'Falha ao autenticar.';
const TIMEOUT_ERROR_MESSAGE = 'A requisição demorou demais. Tente novamente.';

type LoginInput = {
    login: string;
    password: string;
    location: LocationSlug;
};

type LoginApiResponse = {
    status: string;
    message: string;
    data?: AuthSessionData['data'];
};

const createTimeoutController = (timeoutMs: number) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    return {
        signal: controller.signal,
        clear: () => window.clearTimeout(timeoutId),
    };
};

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(apiConfig.apiKey ? { 'X-API-KEY': apiConfig.apiKey } : {}),
});

export const loginWithCredentials = async ({ login, password, location }: LoginInput): Promise<AuthSessionData> => {
    const timeout = createTimeoutController(apiConfig.timeoutMs);

    try {
        const response = await fetch(buildApiUrl(LOGIN_PATH), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ login, password, location }),
            signal: timeout.signal,
        });

        const result = (await response.json()) as LoginApiResponse;

        if (!response.ok || result.status !== 'success' || !result.data) {
            throw new Error(result.message || DEFAULT_ERROR_MESSAGE);
        }

        return {
            status: result.status,
            message: result.message,
            data: result.data,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(TIMEOUT_ERROR_MESSAGE);
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error(DEFAULT_ERROR_MESSAGE);
    } finally {
        timeout.clear();
    }
};
