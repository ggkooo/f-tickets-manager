import Badge from '../../../components/ui/Badges';
import type { TvTicket } from '../types';
import { formatCounterLabel, getServiceBadgeColor, getServicePanelTheme } from '../utils';

interface CurrentTicketPanelProps {
    ticket: TvTicket | null;
    isLoading: boolean;
    error: string | null;
}

const CurrentTicketPanel = ({ ticket, isLoading, error }: CurrentTicketPanelProps) => {
    const panelTheme = getServicePanelTheme(ticket?.serviceType);

    return (
        <section className={`flex-1 min-h-0 flex flex-col justify-center items-center rounded-[1.5rem] lg:rounded-[2rem] 2xl:rounded-[2.5rem] shadow-2xl border p-4 sm:p-6 lg:p-10 2xl:p-12 text-center relative overflow-hidden ${panelTheme.card}`}>
            <div className={`absolute inset-0 animate-pulse rounded-[1.5rem] lg:rounded-[2rem] 2xl:rounded-[2.5rem] z-0 ${panelTheme.aura}`} />

            <div className="relative z-10 w-full flex flex-col items-center">
                <span className="text-[clamp(1.1rem,2vw,2.4rem)] font-bold text-slate-500 uppercase tracking-[0.22em] mb-3 lg:mb-6">
                    Senha Chamada
                </span>

                {isLoading ? (
                    <div className="text-[clamp(1.2rem,2vw,2.2rem)] text-slate-400 mt-6">Carregando...</div>
                ) : error ? (
                    <div className="text-[clamp(1.1rem,1.8vw,2rem)] text-red-500 mt-6">{error}</div>
                ) : ticket ? (
                    <>
                        <div className="flex flex-col items-center gap-3 mb-5 lg:mb-7">
                            <div className="text-[clamp(4rem,10vw,14rem)] font-bold text-[#003B71] leading-none drop-shadow-md">
                                {ticket.key}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 mb-5 lg:mb-7 w-full">
                            <div className="flex items-center justify-center gap-4">
                                <span className={`inline-flex items-center bg-gradient-to-r text-white px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-6 rounded-[1.4rem] lg:rounded-[2.5rem] shadow-2xl text-[clamp(1.3rem,2.7vw,3.8rem)] font-extrabold tracking-[0.08em] drop-shadow-lg ${panelTheme.counterGradient}`}>
                                    Guichê
                                    <span className="ml-3 sm:ml-4 lg:ml-6 text-[clamp(1.9rem,4.2vw,5.8rem)] font-black text-white drop-shadow-xl leading-none">
                                        {formatCounterLabel(ticket.counterName)}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 lg:mt-5 text-[clamp(1.1rem,1.8vw,2.2rem)] text-slate-500 font-medium flex items-center gap-3 justify-center w-full">
                            <Badge color={getServiceBadgeColor(ticket.serviceType)} size="hero">{ticket.serviceType}</Badge>
                        </div>
                    </>
                ) : (
                    <div className="text-[clamp(1.2rem,2vw,2.2rem)] text-slate-400 mt-6">Nenhuma senha chamada</div>
                )}
            </div>
        </section>
    );
};

export default CurrentTicketPanel;