import { useEffect, type RefObject } from 'react';

const VIDEO_SILENCE_ENFORCE_INTERVAL_MS = 1000;

export type HtmlVideoWithAudioTracks = HTMLVideoElement & {
    audioTracks?: ArrayLike<{ enabled: boolean }>;
};

export const enforceSilentVideoPlayback = (element: HTMLVideoElement | null) => {
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

export const useSilentVideoPlayback = (videoRef: RefObject<HTMLVideoElement | null>, deps: unknown[]) => {
    useEffect(() => {
        const enforce = () => {
            enforceSilentVideoPlayback(videoRef.current);
        };

        enforce();
        const intervalId = window.setInterval(enforce, VIDEO_SILENCE_ENFORCE_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
