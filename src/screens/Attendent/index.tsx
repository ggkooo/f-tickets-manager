import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { clearAuthSession, getAuthSession, getUserLocation } from '../../auth/session';
import { buildLocationLoginPath } from '../../locations';
import AttendantTopBar from './components/AttendantTopBar';
import CurrentAttendanceCard from './components/CurrentAttendanceCard';
import HistorySection from './components/HistorySection';
import WaitingQueueSection from './components/WaitingQueueSection';
import { useAttendantHistory } from './hooks/useAttendantHistory';
import { useAttendantQueue } from './hooks/useAttendantQueue';
import { useCurrentAttendance } from './hooks/useCurrentAttendance';

const CLOCK_TICK_INTERVAL_MS = 30000;

const Attendant: React.FC = () => {
    const navigate = useNavigate();
    const [clockTick, setClockTick] = useState(0);

    const loggedCounter = getAuthSession()?.data?.user?.login ?? 'Guichê não identificado';
    const userLocation = getUserLocation();

    const {
        queue,
        isLoadingQueue,
        selectedType,
        serviceTypeOptions,
        setSelectedType,
        refreshQueue,
        removeTicketFromQueue,
    } = useAttendantQueue(userLocation);

    const { history, refreshCompletedHistory } = useAttendantHistory(loggedCounter, userLocation);

    const {
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
    } = useCurrentAttendance({
        queue,
        loggedCounter,
        selectedType,
        removeTicketFromQueue,
        refreshQueue,
        refreshCompletedHistory,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setClockTick((prev) => prev + 1);
        }, CLOCK_TICK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        const nextLoginPath = buildLocationLoginPath(userLocation ?? 'campus');
        clearAuthSession();
        navigate(nextLoginPath, { replace: true });
    };

    return (
        <Layout contentClassName="mx-auto flex w-[97%] flex-grow flex-col items-center justify-center py-8 sm:w-[95%] md:py-10 lg:w-[92%] xl:w-[90%]">
            <div className="w-full max-w-[112rem] grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-8">
                    <AttendantTopBar
                        loggedCounter={loggedCounter}
                        queueLength={queue.length}
                        onLogout={handleLogout}
                    />

                    <CurrentAttendanceCard
                        currentTicket={currentTicket}
                        selectedType={selectedType}
                        serviceTypeOptions={serviceTypeOptions}
                        isLoadingQueue={isLoadingQueue}
                        callingTicketId={callingTicketId}
                        isRecallingCurrentTicket={isRecallingCurrentTicket}
                        isCompletingCurrentTicket={isCompletingCurrentTicket}
                        isCancellingCurrentTicket={isCancellingCurrentTicket}
                        onSelectedTypeChange={setSelectedType}
                        onCallNext={() => void handleCallNext()}
                        onRecallCurrentTicket={() => void handleRecallCurrentTicket()}
                        onCompleteCurrentTicket={() => void handleCompleteCurrentTicket()}
                        onCancelCurrentTicket={() => void handleCancelCurrentTicket()}
                        queueLength={queue.length}
                    />
                </div>

                <div className="lg:col-span-5 flex flex-col gap-8 min-w-0">
                    <WaitingQueueSection
                        queue={queue}
                        isLoadingQueue={isLoadingQueue}
                        callingTicketId={callingTicketId}
                        clockTick={clockTick}
                        onCallSpecificTicket={(ticketId) => void handleCallSpecificTicket(ticketId)}
                    />
                    <HistorySection history={history} />
                </div>
            </div>
        </Layout>
    );
};

export default Attendant;
