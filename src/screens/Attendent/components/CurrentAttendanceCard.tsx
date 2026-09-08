import React from 'react';
import CustomSelect from '../../../components/ui/CustomSelect';
import type { SelectOption, Ticket } from '../types';
import { getServiceBadgeClassName } from '../utils';

interface CurrentAttendanceCardProps {
    currentTicket: Ticket | null;
    selectedType: string;
    serviceTypeOptions: SelectOption[];
    isLoadingQueue: boolean;
    callingTicketId: string | null;
    isRecallingCurrentTicket: boolean;
    isCompletingCurrentTicket: boolean;
    isCancellingCurrentTicket: boolean;
    attendanceError: string | null;
    onSelectedTypeChange: (serviceType: string) => void;
    onCallNext: () => void;
    onRecallCurrentTicket: () => void;
    onCompleteCurrentTicket: () => void;
    onCancelCurrentTicket: () => void;
    queueLength: number;
}

const CurrentAttendanceCard: React.FC<CurrentAttendanceCardProps> = ({
    currentTicket,
    selectedType,
    serviceTypeOptions,
    isLoadingQueue,
    callingTicketId,
    isRecallingCurrentTicket,
    isCompletingCurrentTicket,
    isCancellingCurrentTicket,
    attendanceError,
    onSelectedTypeChange,
    onCallNext,
    onRecallCurrentTicket,
    onCompleteCurrentTicket,
    onCancelCurrentTicket,
    queueLength,
}) => {
    return (
        <div className="bg-white rounded-[2rem] shadow-xl px-5 py-8 lg:px-8 lg:py-10 border border-slate-100 flex flex-col items-center flex-grow justify-center text-center">
            <h2 className="text-2xl text-slate-500 font-bold mb-8 uppercase tracking-wider">Atendimento Atual</h2>

            {currentTicket ? (
                <div className="animate-fade-in flex flex-col items-center">
                    <div className="text-6xl lg:text-8xl font-bold text-[#003B71] mb-4">{currentTicket.number}</div>
                    <div className={`px-8 py-2 rounded-full text-xl font-bold mb-10 inline-block shadow-sm ${getServiceBadgeClassName(currentTicket.serviceType)}`}>
                        {currentTicket.serviceType}
                    </div>
                </div>
            ) : (
                <div className="text-slate-300 text-2xl mb-12 italic">Nenhum atendimento em andamento</div>
            )}

            <div className="w-full max-w-lg flex flex-col gap-4 mt-auto">
                {attendanceError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{attendanceError}</div>
                )}

                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl mx-auto w-full border border-slate-100">
                    <span className="pl-4 text-slate-500 font-medium">Chamar:</span>
                    <CustomSelect
                        value={selectedType}
                        onChange={onSelectedTypeChange}
                        className="flex-grow"
                        options={serviceTypeOptions}
                    />
                </div>

                <button
                    onClick={onCallNext}
                    disabled={queueLength === 0 || isLoadingQueue || callingTicketId !== null || isRecallingCurrentTicket || isCompletingCurrentTicket || isCancellingCurrentTicket}
                    className="bg-primary hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] transition-all w-full text-white font-bold text-xl py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3"
                >
                    <span className="material-icons-outlined !text-3xl">campaign</span>
                    {callingTicketId ? 'Chamando...' : 'Chamar Próximo'}
                </button>

                <button
                    onClick={onRecallCurrentTicket}
                    disabled={!currentTicket || isRecallingCurrentTicket || isCompletingCurrentTicket || isCancellingCurrentTicket || callingTicketId !== null}
                    className="border border-blue-500 text-blue-600 bg-white hover:bg-blue-500 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed active:scale-[0.98] transition-all w-full font-bold text-xl py-5 rounded-2xl shadow-sm flex items-center justify-center gap-3"
                >
                    <span className="material-icons-outlined !text-3xl">replay</span>
                    {isRecallingCurrentTicket ? 'Repetindo...' : 'Repetir Chamada'}
                </button>

                <button
                    onClick={onCompleteCurrentTicket}
                    disabled={!currentTicket || isRecallingCurrentTicket || isCompletingCurrentTicket || isCancellingCurrentTicket || callingTicketId !== null}
                    className="border border-success text-success bg-white hover:bg-success hover:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed active:scale-[0.98] transition-all w-full font-bold text-xl py-5 rounded-2xl shadow-sm flex items-center justify-center gap-3"
                >
                    <span className="material-icons-outlined !text-3xl">task_alt</span>
                    {isCompletingCurrentTicket ? 'Concluindo...' : 'Concluir Senha Atual'}
                </button>

                <button
                    onClick={onCancelCurrentTicket}
                    disabled={!currentTicket || isRecallingCurrentTicket || isCancellingCurrentTicket || isCompletingCurrentTicket || callingTicketId !== null}
                    className="border border-rose-500 text-rose-600 bg-white hover:bg-rose-500 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed active:scale-[0.98] transition-all w-full font-bold text-xl py-5 rounded-2xl shadow-sm flex items-center justify-center gap-3"
                >
                    <span className="material-icons-outlined !text-3xl">cancel</span>
                    {isCancellingCurrentTicket ? 'Cancelando...' : 'Cancelar Senha Atual'}
                </button>
            </div>
        </div>
    );
};

export default CurrentAttendanceCard;
