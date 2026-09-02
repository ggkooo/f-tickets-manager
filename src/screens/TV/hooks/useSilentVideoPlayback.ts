import { useEffect, type RefObject } from 'react';

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

/**
 * The background media loop is muted by design (the alert sound is the only
 * audio the TV should ever play). Some browsers re-enable audio tracks on a
 * video element after a source change, so this re-asserts "muted" on an
 * interval rather than trusting it to stick once.
 */
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
