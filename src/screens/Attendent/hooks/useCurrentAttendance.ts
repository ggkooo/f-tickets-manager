import { useState } from 'react';
import { getAccessToken } from '../../../auth/session';
import {
    cancelTicket,
    callTicket,
    completeTicket,
    recallTicket,
} from '../../../services/attendantService';
import type { Ticket } from '../types';
import { ALL_SERVICE_TYPES } from '../utils';

type UseCurrentAttendanceArgs = {
    queue: Ticket[];
    loggedCounter: string;
    selectedType: string;
    removeTicketFromQueue: (ticketId: string) => void;
    refreshQueue: () => Promise<void>;
    refreshCompletedHistory: () => Promise<void>;
};

/**
 * Owns the ticket currently being attended and every action that can
 * happen to it: call the next one (or a specific one from the queue),
 * recall, complete, cancel. Reads/removes from the queue via the callbacks
 * passed in rather than owning the queue itself.
 */
export const useCurrentAttendance = ({
    queue,
    loggedCounter,
    selectedType,
    removeTicketFromQueue,
    refreshQueue,
    refreshCompletedHistory,
}: UseCurrentAttendanceArgs) => {
    const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
    const [callingTicketId, setCallingTicketId] = useState<string | null>(null);
    const [isRecallingCurrentTicket, setIsRecallingCurrentTicket] = useState(false);
    const [isCompletingCurrentTicket, setIsCompletingCurrentTicket] = useState(false);
    const [isCancellingCurrentTicket, setIsCancellingCurrentTicket] = useState(false);

    const callTicketAtIndex = async (ticketIndex: number, emptyMessage: string) => {
        if (ticketIndex === -1) {
            alert(emptyMessage);
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            alert('Sua sessão expirou. Faça login novamente.');
            return;
        }

        const selectedTicket = queue[ticketIndex];

        if (!selectedTicket) {
            alert('Senha selecionada não está mais na fila.');
            return;
        }

        setCallingTicketId(selectedTicket.id);

        try {
            await callTicket(selectedTicket.id, loggedCounter, accessToken);

            if (currentTicket) {
                await completeTicket(currentTicket.id, accessToken);
                await refreshCompletedHistory();
            }

            setCurrentTicket({ ...selectedTicket, status: 'Called' });
            removeTicketFromQueue(selectedTicket.id);
        } catch (error) {
            console.error(error);
            alert('Falha ao chamar a senha. Tente novamente.');
        } finally {
            setCallingTicketId(null);
        }
    };

    const handleCallNext = async () => {
        const ticketIndex = queue.findIndex(
            (ticket) => selectedType === ALL_SERVICE_TYPES || ticket.serviceType === selectedType,
        );

        await callTicketAtIndex(ticketIndex, `Nenhuma senha do tipo "${selectedType}" aguardando.`);
    };

    const handleCallSpecificTicket = async (ticketId: string) => {
        const ticketIndex = queue.findIndex((ticket) => ticket.id === ticketId);
        await callTicketAtIndex(ticketIndex, 'Senha selecionada não está mais na fila.');
    };

    const handleCompleteCurrentTicket = async () => {
        if (!currentTicket) {
            alert('Nenhuma senha em atendimento para concluir.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            alert('Sua sessão expirou. Faça login novamente.');
            return;
        }

        setIsCompletingCurrentTicket(true);

        try {
            await completeTicket(currentTicket.id, accessToken);
            await refreshCompletedHistory();
            setCurrentTicket(null);
        } catch (error) {
            console.error(error);
            alert('Falha ao concluir a senha. Tente novamente.');
        } finally {
            setIsCompletingCurrentTicket(false);
        }
    };

    const handleRecallCurrentTicket = async () => {
        if (!currentTicket) {
            alert('Nenhuma senha em atendimento para repetir.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            alert('Sua sessão expirou. Faça login novamente.');
            return;
        }

        setIsRecallingCurrentTicket(true);

        try {
            await recallTicket(currentTicket.id, accessToken);
        } catch (error) {
            console.error(error);
            alert('Falha ao repetir a chamada da senha. Tente novamente.');
        } finally {
            setIsRecallingCurrentTicket(false);
        }
    };

    const handleCancelCurrentTicket = async () => {
        if (!currentTicket) {
            alert('Nenhuma senha em atendimento para cancelar.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            alert('Sua sessão expirou. Faça login novamente.');
            return;
        }

        setIsCancellingCurrentTicket(true);

        try {
            await cancelTicket(currentTicket.id, accessToken);
            setCurrentTicket(null);
            await refreshQueue();
        } catch (error) {
            console.error(error);
            alert('Falha ao cancelar a senha. Tente novamente.');
        } finally {
            setIsCancellingCurrentTicket(false);
        }
    };

    return {
        currentTicket,
        callingTicketId,
        isRecallingCurrentTicket,
        isCompletingCurrentTicket,
        isCancellingCurrentTicket,
        handleCallNext,
        handleCallSpecificTicket,
        handleCompleteCurrentTicket,
        handleRecallCurrentTicket,
        handleCancelCurrentTicket,
    };
};
