import { apiConfig, buildApiUrl } from './apiConfig';
import type { LocationSlug } from '../locations';
import { withLocationQuery } from '../locations';
import type { TvMedia, TvTicket } from '../screens/TV/types';
import { getYouTubeEmbedUrl, isDirectVideoFileUrl } from '../screens/TV/utils';
import { request as httpRequest } from './httpClient';

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

const API_KEY = import.meta.env.VITE_API_KEY ?? apiConfig.apiKey;
const RECENTLY_CALLED_PATH = import.meta.env.VITE_TV_RECENTLY_CALLED_PATH ?? `${apiConfig.ticketsPath}/recently-called`;
const VIDEOS_PATH = import.meta.env.VITE_VIDEOS_PATH ?? '/videos';

const getApiHeaders = (): HeadersInit => ({
    ...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
});

const request = async (path: string, init: RequestInit = {}, fallbackMessage: string) =>
    httpRequest(
        buildApiUrl(path),
        {
            ...init,
            headers: {
                ...getApiHeaders(),
                ...init.headers,
            },
        },
        fallbackMessage,
        {
            timeoutMs: apiConfig.timeoutMs,
            timeoutErrorMessage: 'A requisição da TV demorou demais. Tente novamente.',
            genericErrorMessage: 'Falha de comunicação com a API da TV.',
        },
    );

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
