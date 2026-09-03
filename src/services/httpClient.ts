type ApiErrorBody = {
    message?: string;
    error?: string;
    errors?: Record<string, string[] | string>;
};

export const createTimeoutController = (timeoutMs: number) => {
    if (timeoutMs <= 0) {
        return { signal: undefined, clear: () => {} };
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    return {
        signal: controller.signal,
        clear: () => window.clearTimeout(timeoutId),
    };
};

const mapPermissionError = (message: string): string => {
    const normalizedMessage = message.trim().toLowerCase();

    if (normalizedMessage.includes('super administrator access required')) {
        return 'Acesso negado: esta ação é exclusiva de superadministrador.';
    }

    if (normalizedMessage.includes('administrator access required')) {
        return 'Acesso negado: esta ação exige perfil administrador.';
    }

    return message;
};

const getErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

    if (body?.errors && typeof body.errors === 'object') {
        const firstFieldError = Object.values(body.errors)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

        if (firstFieldError) {
            return firstFieldError;
        }
    }

    if (body?.message) {
        return mapPermissionError(body.message);
    }

    if (body?.error) {
        return mapPermissionError(body.error);
    }

    if (response.status === 403) {
        return 'Você não tem permissão para executar esta ação.';
    }

    return fallbackMessage;
};

interface RequestOptions {
    timeoutMs: number;
    onUnauthorized?: () => void;
    timeoutErrorMessage?: string;
    genericErrorMessage?: string;
}

export const request = async (
    url: string,
    init: RequestInit,
    fallbackMessage: string,
    options: RequestOptions,
): Promise<Response> => {
    const {
        timeoutMs,
        onUnauthorized,
        timeoutErrorMessage = 'A requisição demorou demais. Tente novamente.',
        genericErrorMessage = 'Falha de comunicação com a API.',
    } = options;

    const timeout = createTimeoutController(timeoutMs);

    try {
        const response = await fetch(url, {
            ...init,
            signal: timeout.signal,
        });

        if (!response.ok) {
            if (response.status === 401 && onUnauthorized) {
                onUnauthorized();
                throw new Error('Sua sessão expirou. Faça login novamente.');
            }

            throw new Error(await getErrorMessage(response, fallbackMessage));
        }

        return response;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(timeoutErrorMessage);
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error(genericErrorMessage);
    } finally {
        timeout.clear();
    }
};
