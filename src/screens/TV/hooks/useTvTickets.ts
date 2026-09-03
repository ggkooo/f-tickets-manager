import { useEffect, useRef, useState } from 'react';
import { useTicketRealtime } from '../../../hooks/useTicketRealtime';
import type { LocationSlug } from '../../../locations';
import { fetchRecentlyCalledTickets } from '../../../services/tvService';
import type { TvTicket } from '../types';
import { getTicketsSignature } from '../utils';

// useTicketRealtime is wired up and ready, but this network's Kaspersky
// Endpoint Security currently blocks the WebSocket handshake before it
// reaches Reverb (confirmed: raw `new WebSocket()` closes with code 1006,
// no connection ever registers server-side) — until that's allowlisted,
// this poll is the only update path, so it stays at the original interval
// rather than the 60s "safety net" cadence it's meant to be.
const TICKETS_REFRESH_INTERVAL_MS = 5000;

const getTicketAlertSignature = (ticket: TvTicket | null) => {
    if (!ticket) {
        return '';
    }

    return [
        ticket.id,
        ticket.key,
        ticket.serviceType,
        ticket.counterName,
        ticket.updatedAt.getTime(),
        ticket.calledAt?.getTime() ?? 0,
    ].join(':');
};

/**
 * Polls the recently-called tickets for this location and calls `onNewTopTicket`
 * whenever the currently-displayed (top) ticket changes — the TV screen uses
 * that to play the alert sound. Never fires on the very first load (nothing
 * should be announced just because the page opened).
 */
export const useTvTickets = (location: LocationSlug, onNewTopTicket: () => void) => {
    const [tickets, setTickets] = useState<TvTicket[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [ticketsError, setTicketsError] = useState<string | null>(null);

    const hasHydratedTicketsRef = useRef(false);
    const previousTopTicketSignatureRef = useRef('');

    const refreshTickets = async (showLoading = false) => {
        if (showLoading) {
            setIsLoadingTickets(true);
        }

        try {
            const nextTickets = await fetchRecentlyCalledTickets(location);
            const nextTopTicket = nextTickets[0] ?? null;
            const nextTopTicketSignature = getTicketAlertSignature(nextTopTicket);

            if (hasHydratedTicketsRef.current) {
                if (
                    nextTopTicketSignature.length > 0
                    && nextTopTicketSignature !== previousTopTicketSignatureRef.current
                ) {
                    onNewTopTicket();
                }
            } else {
                hasHydratedTicketsRef.current = true;
            }

            previousTopTicketSignatureRef.current = nextTopTicketSignature;

            setTicketsError(null);
            setTickets((previousTickets) => {
                if (getTicketsSignature(previousTickets) === getTicketsSignature(nextTickets)) {
                    return previousTickets;
                }

                return nextTickets;
            });
        } catch (error) {
            setTicketsError(error instanceof Error ? error.message : 'Falha ao carregar as senhas da TV.');
            setTickets((previousTickets) => (previousTickets.length === 0 ? previousTickets : []));
        } finally {
            if (showLoading) {
                setIsLoadingTickets(false);
            }
        }
    };

    useEffect(() => {
        void refreshTickets(true);

        const interval = window.setInterval(() => {
            void refreshTickets();
        }, TICKETS_REFRESH_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [location]);

    useTicketRealtime(location, () => void refreshTickets());

    return { tickets, isLoadingTickets, ticketsError };
};
