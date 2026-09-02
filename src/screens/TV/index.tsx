
import { useEffect, useRef, useState } from 'react';
import Header from '../../components/layout/Header';
import { DEFAULT_UNILAB_LOCATION, type LocationSlug } from '../../locations';
import { useRouteLocation } from '../../locations/useRouteLocation';
import { fetchRecentlyCalledTickets, fetchTvMedia } from '../../services/tvService';
import CurrentTicketPanel from './components/CurrentTicketPanel';
import RecentCallsPanel from './components/RecentCallsPanel';
import VideoPlayerPanel from './components/VideoPlayerPanel';
import type { TvMedia, TvTicket } from './types';
import { getMediaSignature, getTicketsSignature } from './utils';

const TICKETS_REFRESH_INTERVAL_MS = 5000;
const MEDIA_REFRESH_INTERVAL_MS = 30000;
const IMAGE_DISPLAY_DURATION_MS = 10000;
const VIDEO_SILENCE_ENFORCE_INTERVAL_MS = 1000;

type HtmlVideoWithAudioTracks = HTMLVideoElement & {
    audioTracks?: ArrayLike<{ enabled: boolean }>;
};

const enforceSilentVideoPlayback = (element: HTMLVideoElement | null) => {
    if (!element) {
        return;
    }

    element.muted = true;
    element.defaultMuted = true;
    element.volume = 0;
    element.setAttribute('muted', '');

    const trackContainer = element as HtmlVideoWithAudioTracks;

    if (!trackContainer.audioTracks) {
        return;
    }

    for (let index = 0; index < trackContainer.audioTracks.length; index += 1) {
        const track = trackContainer.audioTracks[index];

        if (track) {
            track.enabled = false;
        }
    }
};

const Tv = () => {
    const routeLocation = useRouteLocation();
    const activeLocation = routeLocation ?? DEFAULT_UNILAB_LOCATION;
    const [tickets, setTickets] = useState<TvTicket[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [ticketsError, setTicketsError] = useState<string | null>(null);

    const [mediaItems, setMediaItems] = useState<TvMedia[]>([]);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const alertAudioRef = useRef<HTMLAudioElement | null>(null);
    const previousTopTicketRef = useRef<TvTicket | null>(null);
    const previousTopTicketSignatureRef = useRef('');
    const hasHydratedTicketsRef = useRef(false);
    const mediaUnlockedRef = useRef(false);
    const pendingAlertPlaybackRef = useRef(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const advanceToNextMedia = () => {
        setCurrentMediaIndex((previousIndex) => {
            if (mediaItems.length <= 1) {
                return 0;
            }

            return (previousIndex + 1) % mediaItems.length;
        });
    };

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

    const playTicketAlert = () => {
        const audio = alertAudioRef.current;

        if (!audio) {
            return;
        }

        // Some TV browsers keep stale media state; reset audio properties before every playback.
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audio.defaultMuted = false;
        audio.volume = 1;
        void audio.play().catch(() => {
            pendingAlertPlaybackRef.current = true;

            // Fallback to a fresh instance in case the original audio element became blocked.
            const fallbackAudio = new Audio('/assets/sound/sound.mp3');
            fallbackAudio.preload = 'auto';
            fallbackAudio.muted = false;
            fallbackAudio.defaultMuted = false;
            fallbackAudio.volume = 1;
            fallbackAudio.currentTime = 0;

            void fallbackAudio.play().then(() => {
                pendingAlertPlaybackRef.current = false;
            }).catch(() => {
                // Ignore autoplay blocks silently to avoid interrupting the TV screen flow.
            });
        });
    };

    const refreshTickets = async (location: LocationSlug, showLoading = false) => {
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
                    playTicketAlert();
                }
            } else {
                hasHydratedTicketsRef.current = true;
            }

            previousTopTicketRef.current = nextTopTicket;
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
            setTickets((previousTickets) => {
                if (previousTickets.length === 0) {
                    return previousTickets;
                }

                return [];
            });
        } finally {
            if (showLoading) {
                setIsLoadingTickets(false);
            }
        }
    };

    const refreshMedia = async () => {
        try {
            const nextMedia = await fetchTvMedia();

            setMediaError(null);
            setMediaItems((previousMedia) => {
                if (getMediaSignature(previousMedia) === getMediaSignature(nextMedia)) {
                    return previousMedia;
                }

                return nextMedia;
            });

            setCurrentMediaIndex((previousIndex) => {
                if (nextMedia.length === 0) {
                    return 0;
                }

                return previousIndex >= nextMedia.length ? 0 : previousIndex;
            });
        } catch (error) {
            setMediaError(error instanceof Error ? error.message : 'Falha ao carregar as mídias da TV.');
            setMediaItems((previousMedia) => {
                if (previousMedia.length === 0) {
                    return previousMedia;
                }

                return [];
            });
            setCurrentMediaIndex(0);
        }
    };

    useEffect(() => {
        const audio = new Audio('/assets/sound/sound.mp3');
        audio.preload = 'auto';
        audio.muted = false;
        audio.defaultMuted = false;
        audio.volume = 1;
        alertAudioRef.current = audio;

        void refreshTickets(activeLocation, true);
        void refreshMedia();

        const ticketsInterval = window.setInterval(() => {
            void refreshTickets(activeLocation);
        }, TICKETS_REFRESH_INTERVAL_MS);

        const mediaInterval = window.setInterval(() => {
            void refreshMedia();
        }, MEDIA_REFRESH_INTERVAL_MS);

        return () => {
            window.clearInterval(ticketsInterval);
            window.clearInterval(mediaInterval);

            if (alertAudioRef.current) {
                alertAudioRef.current.pause();
                alertAudioRef.current = null;
            }
        };
    }, [activeLocation]);

    useEffect(() => {
        const unlockMediaPlayback = () => {
            if (mediaUnlockedRef.current) {
                return;
            }

            mediaUnlockedRef.current = true;

            const audio = alertAudioRef.current;

            if (!audio) {
                return;
            }

            audio.muted = true;
            audio.defaultMuted = true;
            audio.volume = 0;
            audio.currentTime = 0;

            void audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
                audio.defaultMuted = false;
                audio.volume = 1;

                if (pendingAlertPlaybackRef.current) {
                    playTicketAlert();
                }
            }).catch(() => {
                // Even if prime playback fails, keep the app flow running.
            });
        };

        window.addEventListener('pointerdown', unlockMediaPlayback, { passive: true });
        window.addEventListener('touchstart', unlockMediaPlayback, { passive: true });
        window.addEventListener('keydown', unlockMediaPlayback);

        return () => {
            window.removeEventListener('pointerdown', unlockMediaPlayback);
            window.removeEventListener('touchstart', unlockMediaPlayback);
            window.removeEventListener('keydown', unlockMediaPlayback);
        };
    }, []);

    useEffect(() => {
        const enforce = () => {
            enforceSilentVideoPlayback(videoRef.current);
        };

        enforce();
        const intervalId = window.setInterval(enforce, VIDEO_SILENCE_ENFORCE_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [currentMediaIndex, mediaItems]);

    useEffect(() => {
        const currentMedia = mediaItems[currentMediaIndex];

        if (currentMedia?.type !== 'image' || mediaItems.length <= 1) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            advanceToNextMedia();
        }, IMAGE_DISPLAY_DURATION_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [currentMediaIndex, mediaItems]);

    return (
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 text-slate-800 h-screen max-h-screen flex flex-col w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute -top-32 -left-32 w-[40vw] h-[40vw] bg-blue-200 opacity-30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-blue-100 opacity-20 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="shrink-0">
                <Header />
            </div>

            <main className="flex-1 min-h-0 overflow-hidden w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-stretch justify-center p-3 sm:p-4 lg:p-4 xl:p-6 2xl:p-8 gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 z-10">
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
                    />
                </div>
            </main>
        </div>
    );
};

export default Tv;
