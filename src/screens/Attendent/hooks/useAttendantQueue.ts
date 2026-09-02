import { useEffect, useMemo, useState } from 'react';
import type { LocationSlug } from '../../../locations';
import { fetchWaitingTickets } from '../../../services/attendantService';
import type { Ticket } from '../types';
import { ALL_SERVICE_TYPES, getQueueSignature } from '../utils';

const QUEUE_REFRESH_INTERVAL_MS = 5000;

/**
 * Owns the waiting queue for this location: polling, and the "which service
 * type is the attendant filtering by" dropdown options derived from it.
 * `removeTicketFromQueue` is how a caller (e.g. useCurrentAttendance, after
 * calling a ticket) takes it out of the waiting list without waiting for
 * the next poll.
 */
export const useAttendantQueue = (userLocation: LocationSlug | null) => {
    const [queue, setQueue] = useState<Ticket[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);
    const [selectedType, setSelectedType] = useState<string>(ALL_SERVICE_TYPES);

    const serviceTypeOptions = useMemo(
        () => [
            { label: 'Próxima Senha (Qualquer)', value: ALL_SERVICE_TYPES },
            ...Array.from(new Set(queue.map((ticket) => ticket.serviceType))).map((serviceType) => ({
                label: serviceType,
                value: serviceType,
            })),
        ],
        [queue],
    );

    const refreshQueue = async (showLoading = false) => {
        if (showLoading) {
            setIsLoadingQueue(true);
        }

        try {
            if (!userLocation) {
                setQueue((prev) => (prev.length === 0 ? prev : []));
                return;
            }

            const waitingTickets = await fetchWaitingTickets(userLocation);

            setQueue((prev) => {
                const previousSignature = getQueueSignature(prev);
                const nextSignature = getQueueSignature(waitingTickets);

                return previousSignature === nextSignature ? prev : waitingTickets;
            });
        } catch (error) {
            console.error(error);
            setQueue((prev) => (prev.length === 0 ? prev : []));
        } finally {
            if (showLoading) {
                setIsLoadingQueue(false);
            }
        }
    };

    const removeTicketFromQueue = (ticketId: string) => {
        setQueue((prev) => prev.filter((ticket) => ticket.id !== ticketId));
    };

    useEffect(() => {
        void refreshQueue(true);

        const interval = setInterval(() => {
            void refreshQueue();
        }, QUEUE_REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    return {
        queue,
        isLoadingQueue,
        selectedType,
        serviceTypeOptions,
        setSelectedType,
        refreshQueue,
        removeTicketFromQueue,
    };
};
