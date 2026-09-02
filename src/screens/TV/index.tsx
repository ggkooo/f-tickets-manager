import { useRef } from 'react';
import Header from '../../components/layout/Header';
import { DEFAULT_UNILAB_LOCATION } from '../../locations';
import { useRouteLocation } from '../../locations/useRouteLocation';
import CurrentTicketPanel from './components/CurrentTicketPanel';
import RecentCallsPanel from './components/RecentCallsPanel';
import VideoPlayerPanel from './components/VideoPlayerPanel';
import { useSilentVideoPlayback } from './hooks/useSilentVideoPlayback';
import { useTicketAlertSound } from './hooks/useTicketAlertSound';
import { useTvMedia } from './hooks/useTvMedia';
import { useTvTickets } from './hooks/useTvTickets';

const Tv = () => {
    const routeLocation = useRouteLocation();
    const activeLocation = routeLocation ?? DEFAULT_UNILAB_LOCATION;
    const videoRef = useRef<HTMLVideoElement>(null);

    const { playAlert } = useTicketAlertSound();
    const { tickets, isLoadingTickets, ticketsError } = useTvTickets(activeLocation, playAlert);
    const { mediaItems, mediaError, currentMediaIndex, reloadNonce, advanceToNextMedia } = useTvMedia(activeLocation);

    useSilentVideoPlayback(videoRef, [currentMediaIndex, mediaItems]);

    return (
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 text-slate-800 h-screen max-h-screen flex flex-col w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute -top-32 -left-32 w-[40vw] h-[40vw] bg-blue-200 opacity-30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-blue-100 opacity-20 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="shrink-0">
                <Header />
            </div>

            <main className="flex-1 min-h-0 overflow-hidden w-full grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] items-stretch justify-center p-3 sm:p-4 lg:p-4 xl:p-6 2xl:p-8 gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 z-10">
                <div className="min-h-0 min-w-0 overflow-hidden flex flex-col gap-3 lg:gap-4 xl:gap-6 2xl:gap-8">
                    <CurrentTicketPanel ticket={tickets[0] ?? null} isLoading={isLoadingTickets} error={ticketsError} />
                </div>

                <div className="min-h-0 min-w-0 overflow-hidden flex flex-col gap-3 lg:gap-4 xl:gap-6 2xl:gap-8">
                    <RecentCallsPanel tickets={tickets} isLoading={isLoadingTickets} error={ticketsError} />
                    <VideoPlayerPanel
                        media={mediaItems[currentMediaIndex] ?? null}
                        hasMultipleItems={mediaItems.length > 1}
                        error={mediaError}
                        videoRef={videoRef}
                        onVideoEnded={advanceToNextMedia}
                        reloadNonce={reloadNonce}
                    />
                </div>
            </main>
        </div>
    );
};

export default Tv;
