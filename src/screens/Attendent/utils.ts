import { type ServiceColor, getServiceColor } from '../../constants/serviceTypeColors';
import type { Ticket } from './types';

export const ALL_SERVICE_TYPES = 'Todos';

const BADGE_CLASS_BY_COLOR: Record<ServiceColor, string> = {
    blue: 'bg-blue-500 text-white',
    red: 'bg-red-500 text-white',
    amber: 'bg-amber-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    rose: 'bg-rose-500 text-white',
    cyan: 'bg-cyan-500 text-white',
    violet: 'bg-violet-500 text-white',
};

// Same color the matching button uses on the "get ticket" screen — see
// src/constants/serviceTypeColors.ts, the single source of truth for both.
export const getServiceBadgeClassName = (serviceType: string): string =>
    BADGE_CLASS_BY_COLOR[getServiceColor(serviceType)];

export const getWaitingTimeLabel = (timestamp: Date): string => {
    const diffMs = Math.max(0, Date.now() - timestamp.getTime());
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) {
        return '<1m';
    }

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
};

export const getWaitingCardClassName = (timestamp: Date): string => {
    const diffMs = Math.max(0, Date.now() - timestamp.getTime());
    const minutes = Math.floor(diffMs / 60000);

    if (minutes >= 25) {
        return 'bg-red-50 border-red-200';
    }

    if (minutes >= 15) {
        return 'bg-amber-50 border-amber-200';
    }

    return 'bg-white border-slate-100';
};

export const getDurationLabel = (startDate: Date, endDate: Date): string => {
    const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
    const totalMinutes = Math.floor(diffMs / 60000);

    if (totalMinutes < 1) {
        return '<1m';
    }

    if (totalMinutes < 60) {
        return `${totalMinutes}m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
};

export const formatCounterLabel = (counterName?: string): string => {
    if (!counterName) {
        return 'Guichê';
    }

    const normalized = counterName.trim();

    if (normalized.length === 0) {
        return 'Guichê';
    }

    return normalized.replace(/_/g, ' ').replace(/^guiche\b/i, 'Guichê');
};

export const getQueueSignature = (tickets: Ticket[]): string => {
    return tickets
        .map((ticket) => `${ticket.id}|${ticket.number}|${ticket.serviceType}|${ticket.timestamp.getTime()}`)
        .join(';');
};

export const getHistorySignature = (tickets: Ticket[]): string => {
    return tickets
        .map((ticket) => {
            const createdAt = ticket.createdAt?.getTime() ?? 0;
            const calledAt = ticket.calledAt?.getTime() ?? 0;
            const counterName = ticket.counterName ?? '';

            return `${ticket.id}|${ticket.number}|${ticket.serviceType}|${ticket.timestamp.getTime()}|${createdAt}|${calledAt}|${counterName}`;
        })
        .join(';');
};
