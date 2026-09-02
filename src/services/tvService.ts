import { apiConfig, buildApiUrl } from './apiConfig';
import type { LocationSlug } from '../locations';
import { withLocationQuery } from '../locations';
import type { TvMedia, TvMediaType, TvTicket } from '../screens/TV/types';

interface ApiTvTicket {
    id: number;
    key: string;
    service_type: string;
    created_at: string;
    updated_at: string;
    guiche: string;
    called_at?: string;
}

type ApiErrorBody = {
    message?: string;
    error?: string;
};

const DEFAULT_API_KEY = 'e15e7aaff2ec79683370eef2fdd01ec0c2ffe94706e73cca7062e026617cc2fb';
const API_KEY = import.meta.env.VITE_API_KEY ?? apiConfig.apiKey ?? DEFAULT_API_KEY;
const RECENTLY_CALLED_PATH = import.meta.env.VITE_TV_RECENTLY_CALLED_PATH ?? `${apiConfig.ticketsPath}/recently-called`;

const createTimeoutController = (timeoutMs: number) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    return {
        signal: controller.signal,
        clear: () => window.clearTimeout(timeoutId),
    };
};

const getApiHeaders = (): HeadersInit => ({
    ...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
});

const getErrorMessage = async (response: Response, fallbackMessage: string) => {
    try {
        const body = (await response.json()) as ApiErrorBody;

        if (body.message) {
            return body.message;
        }

        if (body.error) {
            return body.error;
        }
    } catch {
        // Ignore parse errors and fallback to default error.
    }

    return fallbackMessage;
};

const request = async (path: string, init: RequestInit = {}, fallbackMessage: string) => {
    const timeout = createTimeoutController(apiConfig.timeoutMs);

    try {
        const response = await fetch(buildApiUrl(path), {
            ...init,
            headers: {
                ...getApiHeaders(),
                ...init.headers,
            },
            signal: timeout.signal,
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response, fallbackMessage));
        }

        return response;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('A requisição da TV demorou demais. Tente novamente.');
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Falha de comunicação com a API da TV.');
    } finally {
        timeout.clear();
    }
};

const mapTicket = (ticket: ApiTvTicket): TvTicket => ({
    id: ticket.id,
    key: ticket.key,
    serviceType: ticket.service_type,
    createdAt: new Date(ticket.created_at),
    updatedAt: new Date(ticket.updated_at),
    counterName: ticket.guiche,
    calledAt: ticket.called_at ? new Date(ticket.called_at) : undefined,
});

const buildPublicAssetUrl = (path: string) => path.replace('/public', '');

const buildMediaEntry = (path: string, type: TvMediaType): TvMedia => ({
    filename: path.split('/').pop() || '',
    url: buildPublicAssetUrl(path),
    type,
    createdAt: new Date().toISOString(),
});

export const fetchRecentlyCalledTickets = async (location: LocationSlug) => {
    const response = await request(
        withLocationQuery(RECENTLY_CALLED_PATH, location),
        {
            method: 'GET',
            headers: {
                'X-UNILAB-LOCATION': location,
            },
        },
        'Não foi possível carregar as senhas chamadas.',
    );
    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        return [];
    }

    return (data as ApiTvTicket[]).map(mapTicket);
};

export const fetchTvMedia = async (): Promise<TvMedia[]> => {
    try {
        const videoModules = import.meta.glob('/public/assets/video/**/*.{mp4,webm,ogg,mov,m4v}', { eager: false });
        const imageModules = import.meta.glob('/public/assets/img/tv/**/*.{png,jpg,jpeg,webp,gif}', { eager: false });

        const mediaItems = [
            ...Object.keys(videoModules).map((path) => buildMediaEntry(path, 'video')),
            ...Object.keys(imageModules).map((path) => buildMediaEntry(path, 'image')),
        ];

        return mediaItems.sort((firstItem, secondItem) => firstItem.filename.localeCompare(secondItem.filename));
    } catch {
        return [];
    }
};