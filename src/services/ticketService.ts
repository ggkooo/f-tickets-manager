import { apiConfig, buildApiUrl } from './apiConfig';
import type { LocationSlug } from '../locations';
import { request as httpRequest } from './httpClient';

type CreateTicketInput = {
    serviceType: string;
    location: LocationSlug;
};

type CreateTicketResponse = {
    status?: string;
    message?: string;
    print?: {
        status?: string;
    };
};

export const createTicket = async ({ serviceType, location }: CreateTicketInput) => {
    const response = await httpRequest(
        buildApiUrl(apiConfig.ticketsPath),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiConfig.apiKey ? { 'X-API-KEY': apiConfig.apiKey } : {}),
            },
            body: JSON.stringify({
                service_type: serviceType,
                location,
            }),
        },
        'Não foi possível abrir o atendimento. Tente novamente.',
        { timeoutMs: apiConfig.timeoutMs },
    );

    const body = (await response.json().catch(() => null)) as CreateTicketResponse | null;

    return {
        status: body?.status ?? 'success',
        printStatus: body?.print?.status ?? null,
    };
};
