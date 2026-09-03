import React, { useEffect, useRef, useState } from 'react';
import Badge from '../../../components/ui/Badges';
import type { ServiceColor } from '../../../constants/serviceTypeColors';
import type { TvTicket } from '../types';
import { formatCounterLabel, getServiceBadgeColor } from '../utils';

interface RecentCallsPanelProps {
    tickets: TvTicket[];
    isLoading: boolean;
    error: string | null;
}

interface ServiceTypeBadgeProps {
    serviceType: string;
    color: ServiceColor;
}

const ServiceTypeBadge: React.FC<ServiceTypeBadgeProps> = ({ serviceType, color }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const updateOverflow = () => {
            if (!containerRef.current || !measureRef.current) {
                return;
            }

            setIsOverflowing(measureRef.current.scrollWidth > containerRef.current.clientWidth);
        };

        updateOverflow();
        window.addEventListener('resize', updateOverflow);

        return () => window.removeEventListener('resize', updateOverflow);
    }, [serviceType]);

    return (
        <div className="w-full min-w-0 overflow-hidden">
            <Badge color={color} neonBorder={true} className="w-full min-w-0 overflow-hidden px-[clamp(0.6rem,0.9vw,1rem)] py-[clamp(0.35rem,0.65vh,0.7rem)]">
                <div ref={containerRef} className="relative w-full min-w-0 overflow-hidden">
                    <span ref={measureRef} className="invisible absolute whitespace-nowrap">
                        {serviceType}
                    </span>

                    {isOverflowing ? (
                        <div className="badge-marquee-track">
                            <span className="badge-marquee-text">{serviceType}</span>
                            <span className="badge-marquee-text" aria-hidden="true">{serviceType}</span>
                        </div>
                    ) : (
                        <span className="block w-full text-center whitespace-nowrap">{serviceType}</span>
                    )}
                </div>
            </Badge>
        </div>
    );
};

const RecentCallsPanel: React.FC<RecentCallsPanelProps> = ({ tickets, isLoading, error }) => {
    const recentTickets = tickets.slice(0, 3);

    return (
        <section className="flex-1 min-h-0 flex flex-col bg-white/90 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl border border-slate-100 p-[clamp(0.65rem,1vw,1.35rem)] min-w-0 overflow-hidden">
            <h3 className="text-[clamp(0.95rem,1.4vw,1.45rem)] font-bold text-[#003B71] mb-[clamp(0.35rem,0.8vh,0.75rem)] border-b-2 border-slate-100 pb-[clamp(0.3rem,0.7vh,0.65rem)] text-center">
                Últimas Chamadas
            </h3>

            <div className="grid grid-rows-3 gap-[clamp(0.45rem,1vh,1rem)] flex-1 min-h-0">
                {isLoading ? (
                    <div className="text-[clamp(0.85rem,1.2vw,1.3rem)] text-slate-400">Carregando...</div>
                ) : error ? (
                    <div className="text-[clamp(0.85rem,1.1vw,1.2rem)] text-red-500">{error}</div>
                ) : recentTickets.length === 0 ? (
                    <div className="text-[clamp(0.85rem,1.2vw,1.3rem)] text-slate-400">Nenhuma senha chamada</div>
                ) : (
                    recentTickets.map((ticket, index) => (
                        <div
                            key={ticket.id}
                            className={`min-h-0 h-full grid grid-cols-2 items-center gap-[clamp(0.45rem,0.9vw,1rem)] p-[clamp(0.55rem,1vh,0.95rem)] rounded-xl lg:rounded-2xl transition-all duration-300 overflow-hidden ${index === 0 ? 'bg-slate-50/80' : 'bg-slate-50/40'}`}
                        >
                            <div className="min-w-0 flex items-center gap-3">
                                <span className="text-[clamp(1.1rem,2.2vw,2.4rem)] font-bold text-slate-700 truncate leading-none">
                                    {ticket.key}
                                </span>
                            </div>

                            <div className="min-w-0 flex flex-col items-end gap-[clamp(0.25rem,0.6vh,0.55rem)] overflow-hidden">
                                <div className="w-full min-w-0 flex justify-end overflow-hidden">
                                    <ServiceTypeBadge
                                        serviceType={ticket.serviceType}
                                        color={getServiceBadgeColor(ticket.serviceType)}
                                    />
                                </div>
                                <span className="text-[clamp(0.7rem,1rem,1.1rem)] text-slate-500 block text-right whitespace-nowrap">
                                    Guichê{' '}
                                    <span className="text-[clamp(1rem,1.8vw,2rem)] font-bold text-[#003B71] ml-1 leading-none align-middle">
                                        {formatCounterLabel(ticket.counterName)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default RecentCallsPanel;