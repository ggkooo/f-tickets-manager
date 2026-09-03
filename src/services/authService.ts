import { type AuthSessionData } from '../auth/session';
import type { LocationSlug } from '../locations';
import { apiConfig, buildApiUrl } from './apiConfig';
import { request as httpRequest } from './httpClient';

const LOGIN_PATH = '/login';

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

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(apiConfig.apiKey ? { 'X-API-KEY': apiConfig.apiKey } : {}),
});

export const loginWithCredentials = async ({ login, password, location }: LoginInput): Promise<AuthSessionData> => {
    const response = await httpRequest(
        buildApiUrl(LOGIN_PATH),
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ login, password, location }),
        },
        'Falha ao autenticar.',
        { timeoutMs: apiConfig.timeoutMs },
    );

    const result = (await response.json()) as LoginApiResponse;

    if (!result.data) {
        throw new Error(result.message || 'Falha ao autenticar.');
    }

    return {
        status: result.status,
        message: result.message,
        data: result.data,
    };
};
