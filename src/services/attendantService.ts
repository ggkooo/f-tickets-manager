import { apiConfig, buildApiUrl } from './apiConfig';
import type { LocationSlug } from '../locations';
import { withLocationQuery } from '../locations';
import { handleExpiredSession } from '../auth/sessionExpiry';
import type { ApiTicket, Ticket } from '../screens/Attendent/types';
import { request as httpRequest } from './httpClient';

const getApiHeaders = (accessToken?: string) => ({
    'Content-Type': 'application/json',
    ...(apiConfig.apiKey ? { 'X-API-KEY': apiConfig.apiKey } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const getAuthorizedHeaders = (accessToken: string) => {
    if (!apiConfig.apiKey) {
        throw new Error('Chave de API não configurada. Defina VITE_API_KEY no ambiente.');
    }

    if (!accessToken) {
        throw new Error('Token de acesso não informado. Faça login novamente.');
    }

    return {
        'Content-Type': 'application/json',
        'X-API-KEY': apiConfig.apiKey,
        Authorization: `Bearer ${accessToken}`,
    };
};

const mapWaitingTicket = (ticket: ApiTicket): Ticket => ({
    id: String(ticket.id),
    number: ticket.key,
    serviceType: ticket.service_type,
    status: 'Waiting',
    timestamp: new Date(ticket.created_at),
});

const mapCompletedTicket = (ticket: ApiTicket, fallbackCounter: string): Ticket => {
    const counterFromApi = typeof ticket.guiche === 'string' ? ticket.guiche.trim() : '';

    return {
        id: String(ticket.id),
        number: ticket.key,
        serviceType: ticket.service_type,
        status: 'Called',
        timestamp: new Date(ticket.completed_at ?? ticket.updated_at ?? ticket.created_at),
        createdAt: new Date(ticket.created_at),
        calledAt: ticket.called_at ? new Date(ticket.called_at) : undefined,
        counterName: counterFromApi || fallbackCounter,
    };
};

const request = async (path: string, init: RequestInit = {}) =>
    httpRequest(
        buildApiUrl(path),
        init,
        'Falha de comunicação com a API de atendimento.',
        {
            timeoutMs: apiConfig.timeoutMs,
            onUnauthorized: handleExpiredSession,
            timeoutErrorMessage: 'A requisição de atendimento demorou demais. Tente novamente.',
            genericErrorMessage: 'Falha de comunicação com a API de atendimento.',
        },
    );

export const fetchWaitingTickets = async (location: LocationSlug) => {
    const response = await request(withLocationQuery(apiConfig.ticketsPath, location), {
        method: 'GET',
        headers: {
            ...getApiHeaders(),
            'X-UNILAB-LOCATION': location,
        },
    });

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        return [];
    }

    return (data as ApiTicket[])
        .filter((ticket) => !ticket.completed)
        .map(mapWaitingTicket);
};

export const fetchCompletedTickets = async (fallbackCounter: string, accessToken: string) => {
    const response = await request(`${apiConfig.ticketsPath}/completed`, {
        method: 'GET',
        headers: getAuthorizedHeaders(accessToken),
    });

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        return [];
    }

    return (data as ApiTicket[])
        .map((ticket) => mapCompletedTicket(ticket, fallbackCounter))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);
};

export const callTicket = async (ticketId: string, counterName: string, accessToken: string) => {
    await request(`${apiConfig.ticketsPath}/${ticketId}/call`, {
        method: 'POST',
        headers: getAuthorizedHeaders(accessToken),
        body: JSON.stringify({ guiche: counterName }),
    });
};

export const completeTicket = async (ticketId: string, accessToken: string) => {
    await request(`${apiConfig.ticketsPath}/${ticketId}/complete`, {
        method: 'PATCH',
        headers: getAuthorizedHeaders(accessToken),
    });
};

export const cancelTicket = async (ticketId: string, accessToken: string) => {
    await request(`${apiConfig.ticketsPath}/${ticketId}/cancel`, {
        method: 'PATCH',
        headers: getAuthorizedHeaders(accessToken),
    });
};

export const recallTicket = async (ticketId: string, accessToken: string) => {
    await request(`${apiConfig.ticketsPath}/${ticketId}/recall`, {
        method: 'POST',
        headers: getAuthorizedHeaders(accessToken),
    });
};
