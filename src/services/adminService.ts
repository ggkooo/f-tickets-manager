import { apiConfig, buildApiUrl } from './apiConfig';
import { handleExpiredSession } from '../auth/sessionExpiry';

export interface ApiUser {
    id: number;
    uuid: string;
    name: string;
    login: string;
    location?: string;
    active: boolean;
    is_admin: boolean;
    is_super_admin?: boolean;
    created_at: string;
    updated_at: string;
}

export type VideoType = 'upload' | 'link';

export interface ApiVideo {
    id: number;
    type: VideoType;
    filename: string | null;
    url: string | null;
}

export interface AttendanceReportResponse {
    period: {
        start_date: string;
        end_date: string;
        days: number;
    };
    average_wait_time: {
        seconds: number;
        formatted: string;
    };
    average_attendances_per_day: number;
    attendances_per_day: Record<string, number>;
    attendances_by_type: Record<string, number>;
    attendances_by_outcome: Record<string, number>;
    attendances_by_guiche?: Array<{
        guiche: string;
        attended_by_user_id: number;
        attended_by_user_name: string;
        attended_by_user_login: string;
        total: number;
        completed: number;
        canceled: number;
        unknown: number;
    }>;
    attendances_by_user?: Array<{
        user_id: number;
        name: string;
        login: string;
        guiche: string;
        total: number;
        completed: number;
        canceled: number;
        unknown: number;
    }>;
    total_attendances: number;
}

export interface UpdateUserPayload {
    name: string;
    login: string;
    active: boolean;
    is_admin: boolean;
    password?: string;
}

export interface RegisterUserPayload {
    name: string;
    login: string;
    password: string;
    password_confirmation: string;
}

export type PrinterConnectionType = 'network' | 'shared_windows';

export interface PrinterSettingsPayload {
    name: string;
    enabled: boolean;
    connection_type: PrinterConnectionType;
    host?: string;
    port?: number;
    share_path?: string;
    profile?: string;
    header?: string;
}

export interface PrinterSettingsResponse {
    id: number;
    location: string;
    name: string;
    enabled: boolean;
    connection_type: PrinterConnectionType;
    host?: string;
    port?: number;
    share_path?: string;
    profile?: string;
    header?: string;
    created_at: string;
    updated_at: string;
}

export interface PrinterSettingsListResponse {
    location: string;
    data: PrinterSettingsResponse[];
}

export interface UpdatePrinterSettingsPayload {
    name?: string;
    enabled?: boolean;
    connection_type?: PrinterConnectionType;
    host?: string;
    port?: number;
    share_path?: string;
    profile?: string;
    header?: string;
}

interface PrinterSettingsMutationResponse {
    message: string;
    data: PrinterSettingsResponse;
}

const API_KEY = import.meta.env.VITE_API_KEY ?? apiConfig.apiKey;
const USERS_PATH = import.meta.env.VITE_USERS_PATH ?? '/users';
const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH ?? '/register';
const MAKE_ADMIN_SUFFIX = '/make-admin';
const REMOVE_ADMIN_SUFFIX = '/remove-admin';
const VIDEOS_PATH = import.meta.env.VITE_VIDEOS_PATH ?? '/videos';
const ATTENDANCE_REPORT_PATH = import.meta.env.VITE_REPORT_PDF_PATH ?? '/reports/attendances';
const PRINTER_SETTINGS_PATH = import.meta.env.VITE_PRINTER_SETTINGS_PATH ?? '/printer-settings';

type ApiErrorBody = {
    message?: string;
    error?: string;
    errors?: Record<string, string[] | string>;
};

// A timeoutMs of 0 (or less) disables the timeout entirely — used for large
// video uploads, which can legitimately take much longer than a normal API
// call and shouldn't be aborted mid-transfer.
const createTimeoutController = (timeoutMs: number) => {
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

const buildAuthHeaders = (accessToken?: string): HeadersInit => ({
    'X-API-KEY': API_KEY,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const buildJsonHeaders = (accessToken?: string): HeadersInit => ({
    ...buildAuthHeaders(accessToken),
    'Content-Type': 'application/json',
});

const getErrorMessage = async (response: Response, fallbackMessage: string) => {
    const mapPermissionError = (message: string) => {
        const normalizedMessage = message.trim().toLowerCase();

        if (normalizedMessage.includes('super administrator access required')) {
            return 'Acesso negado: esta ação é exclusiva de superadministrador.';
        }

        if (normalizedMessage.includes('administrator access required')) {
            return 'Acesso negado: esta ação exige perfil administrador.';
        }

        return message;
    };

    try {
        const body = (await response.json()) as ApiErrorBody;

        if (body.errors && typeof body.errors === 'object') {
            const firstFieldError = Object.values(body.errors)
                .flatMap((value) => (Array.isArray(value) ? value : [value]))
                .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

            if (firstFieldError) {
                return firstFieldError;
            }
        }

        if (body.message) {
            return mapPermissionError(body.message);
        }

        if (body.error) {
            return mapPermissionError(body.error);
        }
    } catch {
        // Ignore parse errors and fallback to default error.
    }

    if (response.status === 403) {
        return 'Você não tem permissão para executar esta ação.';
    }

    return fallbackMessage;
};

const request = async (url: string, init: RequestInit, fallbackMessage: string, timeoutMs: number = apiConfig.timeoutMs) => {
    const timeout = createTimeoutController(timeoutMs);

    try {
        const response = await fetch(url, {
            ...init,
            signal: timeout.signal,
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleExpiredSession();
                throw new Error('Sua sessão expirou. Faça login novamente.');
            }

            throw new Error(await getErrorMessage(response, fallbackMessage));
        }

        return response;
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

export const fetchAdminUsers = async (accessToken?: string) => {
    const response = await request(
        buildApiUrl(USERS_PATH),
        {
            method: 'GET',
            headers: buildAuthHeaders(accessToken),
        },
        'Não foi possível carregar os usuários.',
    );

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as ApiUser[]) : [];
};

export const registerAdminUser = async (payload: RegisterUserPayload, accessToken?: string) => {
    await request(
        buildApiUrl(REGISTER_PATH),
        {
            method: 'POST',
            headers: buildJsonHeaders(accessToken),
            body: JSON.stringify(payload),
        },
        'Não foi possível cadastrar o usuário.',
    );
};

export const updateAdminUser = async (userId: number, payload: UpdateUserPayload, accessToken?: string) => {
    await request(
        buildApiUrl(`${USERS_PATH}/${userId}`),
        {
            method: 'PATCH',
            headers: buildJsonHeaders(accessToken),
            body: JSON.stringify(payload),
        },
        'Não foi possível atualizar o usuário.',
    );
};

export const deleteAdminUser = async (userId: number, accessToken?: string) => {
    await request(
        buildApiUrl(`${USERS_PATH}/${userId}`),
        {
            method: 'DELETE',
            headers: buildAuthHeaders(accessToken),
        },
        'Não foi possível remover o usuário.',
    );
};

export const toggleUserAdminRole = async (user: ApiUser, accessToken?: string) => {
    const endpointSuffix = user.is_admin ? REMOVE_ADMIN_SUFFIX : MAKE_ADMIN_SUFFIX;

    await request(
        buildApiUrl(`${USERS_PATH}/${user.id}${endpointSuffix}`),
        {
            method: 'PATCH',
            headers: buildAuthHeaders(accessToken),
        },
        'Não foi possível alterar o perfil administrativo.',
    );
};

export const fetchAdminVideos = async (accessToken?: string) => {
    const response = await request(
        buildApiUrl(VIDEOS_PATH),
        {
            method: 'GET',
            headers: buildAuthHeaders(accessToken),
        },
        'Não foi possível carregar os vídeos.',
    );

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as ApiVideo[]) : [];
};

export const deleteAdminVideo = async (videoId: number, accessToken?: string) => {
    await request(
        buildApiUrl(`${VIDEOS_PATH}/${videoId}`),
        {
            method: 'DELETE',
            headers: buildAuthHeaders(accessToken),
        },
        'Não foi possível remover o vídeo.',
    );
};

export const uploadAdminVideo = async (file: File, accessToken?: string) => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await request(
        buildApiUrl(`${VIDEOS_PATH}/upload`),
        {
            method: 'POST',
            headers: buildAuthHeaders(accessToken),
            body: formData,
        },
        'Não foi possível enviar o vídeo.',
        0, // no timeout — uploads can be up to 5GB and take a while
    );

    const body = (await response.json()) as { data: ApiVideo };
    return body.data;
};

export const addAdminVideoLink = async (url: string, accessToken?: string) => {
    const response = await request(
        buildApiUrl(`${VIDEOS_PATH}/link`),
        {
            method: 'POST',
            headers: buildJsonHeaders(accessToken),
            body: JSON.stringify({ url }),
        },
        'Não foi possível adicionar o link do vídeo.',
    );

    const body = (await response.json()) as { data: ApiVideo };
    return body.data;
};

export const fetchAttendanceReport = async (startDate: string, endDate: string, accessToken?: string) => {
    const queryString = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
    });

    const response = await request(
        `${buildApiUrl(ATTENDANCE_REPORT_PATH)}?${queryString.toString()}`,
        {
            method: 'GET',
            headers: buildAuthHeaders(accessToken),
        },
        'Não foi possível gerar o relatório do período informado.',
    );

    return (await response.json()) as AttendanceReportResponse;
};

export const fetchPrinterSettings = async (accessToken?: string) => {
    const response = await request(
        buildApiUrl(PRINTER_SETTINGS_PATH),
        {
            method: 'GET',
            headers: buildAuthHeaders(accessToken),
        },
        'Nao foi possivel carregar as configuracoes da impressora.',
    );

    return (await response.json()) as PrinterSettingsListResponse;
};

export const createPrinterSettings = async (payload: PrinterSettingsPayload, accessToken?: string) => {
    const response = await request(
        buildApiUrl(PRINTER_SETTINGS_PATH),
        {
            method: 'POST',
            headers: buildJsonHeaders(accessToken),
            body: JSON.stringify(payload),
        },
        'Nao foi possivel salvar as configuracoes da impressora.',
    );

    const data = (await response.json()) as PrinterSettingsMutationResponse;
    return data.data;
};

export const updatePrinterSettings = async (printerSettingId: number, payload: UpdatePrinterSettingsPayload, accessToken?: string) => {
    const response = await request(
        buildApiUrl(`${PRINTER_SETTINGS_PATH}/${printerSettingId}`),
        {
            method: 'PATCH',
            headers: buildJsonHeaders(accessToken),
            body: JSON.stringify(payload),
        },
        'Nao foi possivel atualizar a configuracao da impressora.',
    );

    const data = (await response.json()) as PrinterSettingsMutationResponse;
    return data.data;
};
