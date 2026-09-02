import { apiConfig, buildApiUrl } from './apiConfig';
import type { LocationSlug } from '../locations';

type CreateTicketInput = {
    serviceType: string;
    location: LocationSlug;
};

type ApiErrorBody = {
    message?: string;
};

type CreateTicketResponse = {
    status?: string;
    message?: string;
    print?: {
        status?: string;
    };
};

const createTimeoutController = (timeoutMs: number) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    return {
        signal: controller.signal,
        clear: () => window.clearTimeout(timeoutId),
    };
};

const getErrorMessage = async (response: Response) => {
    try {
        const body = (await response.json()) as ApiErrorBody;

        if (body.message) {
            return body.message;
        }
    } catch {
        // Ignore parse errors and fallback to default message.
    }

    return 'Não foi possível abrir o atendimento. Tente novamente.';
};

export const createTicket = async ({ serviceType, location }: CreateTicketInput) => {
    const timeout = createTimeoutController(apiConfig.timeoutMs);

    try {
        const response = await fetch(buildApiUrl(apiConfig.ticketsPath), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiConfig.apiKey ? { 'X-API-KEY': apiConfig.apiKey } : {}),
            },
            body: JSON.stringify({
                service_type: serviceType,
                location,
            }),
            signal: timeout.signal,
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const body = (await response.json().catch(() => null)) as CreateTicketResponse | null;

        return {
            status: body?.status ?? 'success',
            printStatus: body?.print?.status ?? null,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('A requisição demorou demais. Tente novamente.');
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Falha de comunicação com a API.');
    } finally {
        timeout.clear();
    }
};
