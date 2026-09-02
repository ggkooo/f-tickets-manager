import { getServiceColor, type ServiceColor } from '../../constants/serviceTypeColors';
import type { TvMedia, TvTicket } from './types';

export const formatCounterLabel = (counterName: string) => counterName.replace(/^guiche_/i, '');

// Same color the button on the "get ticket" screen and the /attendent badge
// use for this service type — see src/constants/serviceTypeColors.ts.
export const getServiceBadgeColor = (serviceType: string): ServiceColor => getServiceColor(serviceType);

const PANEL_THEME_BY_COLOR: Record<ServiceColor, { card: string; aura: string; counterGradient: string }> = {
    blue: {
        card: 'bg-blue-50/70 border-blue-400/90 neon-pulse-blue',
        aura: 'bg-blue-100/50',
        counterGradient: 'from-blue-500 to-sky-500',
    },
    red: {
        card: 'bg-red-50/70 border-red-400/90 neon-pulse-red',
        aura: 'bg-red-100/50',
        counterGradient: 'from-red-500 to-rose-500',
    },
    amber: {
        card: 'bg-amber-50/70 border-amber-400/90 neon-pulse-amber',
        aura: 'bg-amber-100/50',
        counterGradient: 'from-amber-500 to-yellow-500',
    },
    indigo: {
        card: 'bg-indigo-50/70 border-indigo-400/90 neon-pulse-indigo',
        aura: 'bg-indigo-100/50',
        counterGradient: 'from-indigo-500 to-blue-500',
    },
    emerald: {
        card: 'bg-emerald-50/70 border-emerald-400/90 neon-pulse-emerald',
        aura: 'bg-emerald-100/50',
        counterGradient: 'from-emerald-500 to-green-500',
    },
    rose: {
        card: 'bg-rose-50/70 border-rose-400/90 neon-pulse-rose',
        aura: 'bg-rose-100/50',
        counterGradient: 'from-rose-500 to-pink-500',
    },
    cyan: {
        card: 'bg-cyan-50/70 border-cyan-400/90 neon-pulse-cyan',
        aura: 'bg-cyan-100/50',
        counterGradient: 'from-cyan-500 to-sky-500',
    },
    violet: {
        card: 'bg-violet-50/70 border-violet-400/90 neon-pulse-violet',
        aura: 'bg-violet-100/50',
        counterGradient: 'from-violet-500 to-purple-500',
    },
};

export const getServicePanelTheme = (serviceType?: string) => PANEL_THEME_BY_COLOR[getServiceColor(serviceType ?? '')];

export const getTicketsSignature = (tickets: TvTicket[]) =>
    tickets.map((ticket) => `${ticket.id}:${ticket.updatedAt.getTime()}:${ticket.counterName}`).join('|');

export const getMediaSignature = (mediaItems: TvMedia[]) =>
    mediaItems.map((media) => `${media.type}:${media.filename}:${media.url}:${media.createdAt ?? ''}`).join('|');