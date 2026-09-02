import { useEffect, useState } from 'react';
import { getAccessToken } from '../../../auth/session';
import { fetchCompletedTickets } from '../../../services/attendantService';
import type { Ticket } from '../types';
import { getHistorySignature } from '../utils';

const HISTORY_REFRESH_INTERVAL_MS = 5000;

/**
 * Owns today's completed-attendance history for this attendant's counter.
 */
export const useAttendantHistory = (loggedCounter: string) => {
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

    return { history, refreshCompletedHistory };
};
