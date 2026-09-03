import { useEffect, useState } from 'react';
import { getAccessToken } from '../../../auth/session';
import { useTicketRealtime } from '../../../hooks/useTicketRealtime';
import type { LocationSlug } from '../../../locations';
import { fetchCompletedTickets } from '../../../services/attendantService';
import type { Ticket } from '../types';
import { getHistorySignature } from '../utils';

const HISTORY_REFRESH_INTERVAL_MS = 5000;

export const useAttendantHistory = (loggedCounter: string, location: LocationSlug | null) => {
    const [history, setHistory] = useState<Ticket[]>([]);

    const refreshCompletedHistory = async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
            setHistory((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        try {
            const completedTickets = await fetchCompletedTickets(loggedCounter, accessToken);

            setHistory((prev) => {
                const previousSignature = getHistorySignature(prev);
                const nextSignature = getHistorySignature(completedTickets);

                return previousSignature === nextSignature ? prev : completedTickets;
            });
        } catch (error) {
            console.error(error);
            setHistory((prev) => (prev.length === 0 ? prev : []));
        }
    };

    useEffect(() => {
        void refreshCompletedHistory();

        const interval = setInterval(() => {
            void refreshCompletedHistory();
        }, HISTORY_REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    useTicketRealtime(location, () => void refreshCompletedHistory());

    return { history, refreshCompletedHistory };
};
