import { useEffect, useRef } from 'react';

const ALERT_SOUND_SRC = '/assets/sound/sound.mp3';

/**
 * Owns the "new ticket called" alert sound: creates/cleans up the Audio
 * element, and works around browser autoplay policy by silently priming
 * playback on the totem's first touch/click/keypress (TVs load this screen
 * unattended, before anyone has interacted with the page).
 *
 * Returns `playAlert()` — call it whenever a new ticket should be announced.
 */
export const useTicketAlertSound = () => {
    const alertAudioRef = useRef<HTMLAudioElement | null>(null);
    const mediaUnlockedRef = useRef(false);
    const pendingAlertPlaybackRef = useRef(false);

    const playAlert = () => {
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
            const fallbackAudio = new Audio(ALERT_SOUND_SRC);
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

    useEffect(() => {
        const audio = new Audio(ALERT_SOUND_SRC);
        audio.preload = 'auto';
        audio.muted = false;
        audio.defaultMuted = false;
        audio.volume = 1;
        alertAudioRef.current = audio;

        return () => {
            if (alertAudioRef.current) {
                alertAudioRef.current.pause();
                alertAudioRef.current = null;
            }
        };
    }, []);

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
                    playAlert();
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

    return { playAlert };
};
