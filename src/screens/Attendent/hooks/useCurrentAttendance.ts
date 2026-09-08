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
    const [attendanceError, setAttendanceError] = useState<string | null>(null);

    const callTicketAtIndex = async (ticketIndex: number, emptyMessage: string) => {
        setAttendanceError(null);

        if (ticketIndex === -1) {
            setAttendanceError(emptyMessage);
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            setAttendanceError('Sua sessão expirou. Faça login novamente.');
            return;
        }

        const selectedTicket = queue[ticketIndex];

        if (!selectedTicket) {
            setAttendanceError('Senha selecionada não está mais na fila.');
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
            setAttendanceError(error instanceof Error ? error.message : 'Falha ao chamar a senha. Tente novamente.');
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
        setAttendanceError(null);

        if (!currentTicket) {
            setAttendanceError('Nenhuma senha em atendimento para concluir.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            setAttendanceError('Sua sessão expirou. Faça login novamente.');
            return;
        }

        setIsCompletingCurrentTicket(true);

        try {
            await completeTicket(currentTicket.id, accessToken);
            await refreshCompletedHistory();
            setCurrentTicket(null);
        } catch (error) {
            console.error(error);
            setAttendanceError(error instanceof Error ? error.message : 'Falha ao concluir a senha. Tente novamente.');
        } finally {
            setIsCompletingCurrentTicket(false);
        }
    };

    const handleRecallCurrentTicket = async () => {
        setAttendanceError(null);

        if (!currentTicket) {
            setAttendanceError('Nenhuma senha em atendimento para repetir.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            setAttendanceError('Sua sessão expirou. Faça login novamente.');
            return;
        }

        setIsRecallingCurrentTicket(true);

        try {
            await recallTicket(currentTicket.id, accessToken);
        } catch (error) {
            console.error(error);
            setAttendanceError(error instanceof Error ? error.message : 'Falha ao repetir a chamada da senha. Tente novamente.');
        } finally {
            setIsRecallingCurrentTicket(false);
        }
    };

    const handleCancelCurrentTicket = async () => {
        setAttendanceError(null);

        if (!currentTicket) {
            setAttendanceError('Nenhuma senha em atendimento para cancelar.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            setAttendanceError('Sua sessão expirou. Faça login novamente.');
            return;
        }

        setIsCancellingCurrentTicket(true);

        try {
            await cancelTicket(currentTicket.id, accessToken);
            setCurrentTicket(null);
            await refreshQueue();
        } catch (error) {
            console.error(error);
            setAttendanceError(error instanceof Error ? error.message : 'Falha ao cancelar a senha. Tente novamente.');
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
        attendanceError,
        handleCallNext,
        handleCallSpecificTicket,
        handleCompleteCurrentTicket,
        handleRecallCurrentTicket,
        handleCancelCurrentTicket,
    };
};
