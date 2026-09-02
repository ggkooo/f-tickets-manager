import { apiConfig, buildApiUrl } from './apiConfig';
import type { LocationSlug } from '../locations';
import { withLocationQuery } from '../locations';
import type { TvMedia, TvTicket } from '../screens/TV/types';
import { getYouTubeEmbedUrl, isDirectVideoFileUrl } from '../screens/TV/utils';

interface ApiTvTicket {
    id: number;
    key: string;
    service_type: string;
    created_at: string;
    updated_at: string;
    guiche: string;
    called_at?: string;
}

interface ApiVideo {
    id: number;
    type: 'upload' | 'link';
    filename: string | null;
    url: string | null;
}

type ApiErrorBody = {
    message?: string;
    error?: string;
};

const DEFAULT_API_KEY = 'e15e7aaff2ec79683370eef2fdd01ec0c2ffe94706e73cca7062e026617cc2fb';
const API_KEY = import.meta.env.VITE_API_KEY ?? apiConfig.apiKey ?? DEFAULT_API_KEY;
const RECENTLY_CALLED_PATH = import.meta.env.VITE_TV_RECENTLY_CALLED_PATH ?? `${apiConfig.ticketsPath}/recently-called`;
const VIDEOS_PATH = import.meta.env.VITE_VIDEOS_PATH ?? '/videos';

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

const mapVideo = (video: ApiVideo): TvMedia | null => {
    if (!video.url) {
        return null;
    }

    if (video.type === 'upload') {
        return { id: video.id, kind: 'video', url: video.url };
    }

    const embedUrl = getYouTubeEmbedUrl(video.url);

    if (embedUrl) {
        return { id: video.id, kind: 'youtube', url: embedUrl };
    }

    if (isDirectVideoFileUrl(video.url)) {
        return { id: video.id, kind: 'video', url: video.url };
    }

    // Not YouTube and not a direct video file — an arbitrary webpage link,
    // rendered as a plain iframe since we can't play it as a <video>.
    return { id: video.id, kind: 'embed', url: video.url };
};

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

export const fetchTvMedia = async (location: LocationSlug): Promise<TvMedia[]> => {
    try {
        const response = await request(
            withLocationQuery(VIDEOS_PATH, location),
            {
                method: 'GET',
                headers: {
                    'X-UNILAB-LOCATION': location,
                },
            },
            'Não foi possível carregar as mídias da TV.',
        );
        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        return (data as ApiVideo[])
            .map(mapVideo)
            .filter((media): media is TvMedia => media !== null);
    } catch {
        return [];
    }
};