export const SERVICE_COLORS = ['blue', 'red', 'amber', 'indigo', 'emerald', 'rose', 'cyan', 'violet'] as const;

export type ServiceColor = (typeof SERVICE_COLORS)[number];

const DEFAULT_SERVICE_COLOR: ServiceColor = 'blue';

const SERVICE_TYPE_COLORS: Record<string, ServiceColor> = {
    'Atendimento Normal': 'blue',
    'Atendimento Preferencial': 'red',
    'Retirada de Exames ou Entrega de Amostras': 'amber',
    'Acadêmico/Matrículas': 'indigo',
    'Solicitação de Documentos': 'emerald',
    'Impressão de Boletos': 'rose',
    'Financiamentos e Bolsas': 'cyan',
    'Renegociação de Mensalidades': 'violet',
};

export const getServiceColor = (serviceType: string): ServiceColor =>
    SERVICE_TYPE_COLORS[serviceType] ?? DEFAULT_SERVICE_COLOR;

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
