export const AUTH_SESSION_KEY = 'totem_auth';

import type { LocationSlug } from '../locations';

export interface AuthSessionData {
    status: string;
    message: string;
    data: {
        access_token: string;
        token_type: string;
        user: {
            id: number;
            uuid: string;
            name: string;
            login: string;
            location: LocationSlug;
            active: boolean;
            is_admin: boolean;
            is_super_admin: boolean;
            created_at: string;
            updated_at: string;
        };
    };
}

const isBrowser = typeof window !== 'undefined';

export const setAuthSession = (authSession: AuthSessionData): void => {
    if (!isBrowser) {
        return;
    }

    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
    localStorage.removeItem(AUTH_SESSION_KEY);
};

export const clearAuthSession = (): void => {
    if (!isBrowser) {
        return;
    }

    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
};

export const getAuthSession = (): AuthSessionData | null => {
    if (!isBrowser) {
        return null;
    }

    const rawData = sessionStorage.getItem(AUTH_SESSION_KEY);

    if (!rawData) {
        return null;
    }

    try {
        return JSON.parse(rawData) as AuthSessionData;
    } catch {
        return null;
    }
};

export const getAccessToken = (): string | null => {
    const session = getAuthSession();
    return session?.data?.access_token ?? null;
};

export const isAdminUser = (): boolean => {
    const session = getAuthSession();
    return session?.data?.user?.is_admin ?? false;
};

export const isSuperAdminUser = (): boolean => {
    const session = getAuthSession();
    return session?.data?.user?.is_super_admin ?? false;
};

export const hasAdminAccess = (): boolean => {
    const session = getAuthSession();
    const user = session?.data?.user;

    return Boolean(user?.is_admin || user?.is_super_admin);
};

export const getUserLocation = (): LocationSlug | null => {
    const session = getAuthSession();
    return session?.data?.user?.location ?? null;
};
