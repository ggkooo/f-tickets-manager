/**
 * Single source of truth for "which color belongs to which service type".
 *
 * The GetTicket screen (the button someone taps to pull a ticket) and the
 * Attendant screen (the badge showing what a ticket is for) must always
 * agree on this color, so both read from this same map instead of each
 * keeping their own copy.
 */
export const SERVICE_COLORS = ['blue', 'red', 'amber', 'indigo', 'emerald', 'rose', 'cyan', 'violet'] as const;

export type ServiceColor = (typeof SERVICE_COLORS)[number];

const DEFAULT_SERVICE_COLOR: ServiceColor = 'blue';

const SERVICE_TYPE_COLORS: Record<string, ServiceColor> = {
    // Unilab
    'Atendimento Normal': 'blue',
    'Atendimento Preferencial': 'red',
    'Retirada de Exames ou Entrega de Amostras': 'amber',
    // CRE
    'Acadêmico/Matrículas': 'indigo',
    'Solicitação de Documentos': 'emerald',
    'Impressão de Boletos': 'rose',
    'Financiamentos e Bolsas': 'cyan',
    'Renegociação de Mensalidades': 'violet',
};

export const getServiceColor = (serviceType: string): ServiceColor =>
    SERVICE_TYPE_COLORS[serviceType] ?? DEFAULT_SERVICE_COLOR;

/** Solid hex fill for each color — used by the TV screen's badges. */
export const SERVICE_COLOR_HEX: Record<ServiceColor, string> = {
    blue: '#3B82F6',
    red: '#EF4444',
    amber: '#F59E0B',
    indigo: '#6366F1',
    emerald: '#10B981',
    rose: '#F43F5E',
    cyan: '#06B6D4',
    violet: '#8B5CF6',
};

/** Matches the `.neon-pulse-*` keyframe classes defined in App.css. */
export const SERVICE_COLOR_NEON_CLASS: Record<ServiceColor, string> = {
    blue: 'neon-pulse-blue',
    red: 'neon-pulse-red',
    amber: 'neon-pulse-amber',
    indigo: 'neon-pulse-indigo',
    emerald: 'neon-pulse-emerald',
    rose: 'neon-pulse-rose',
    cyan: 'neon-pulse-cyan',
    violet: 'neon-pulse-violet',
};
