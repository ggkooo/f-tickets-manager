import { useEffect, useRef } from 'react';

const ALERT_SOUND_SRC = '/assets/sound/sound.mp3';

export const useTicketAlertSound = () => {
    const alertAudioRef = useRef<HTMLAudioElement | null>(null);
    const mediaUnlockedRef = useRef(false);
    const pendingAlertPlaybackRef = useRef(false);

    const playAlert = () => {
        const audio = alertAudioRef.current;

        if (!audio) {
            return;
        }

        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audio.defaultMuted = false;
        audio.volume = 1;
        void audio.play().catch(() => {
            pendingAlertPlaybackRef.current = true;

            const fallbackAudio = new Audio(ALERT_SOUND_SRC);
            fallbackAudio.preload = 'auto';
            fallbackAudio.muted = false;
            fallbackAudio.defaultMuted = false;
            fallbackAudio.volume = 1;
            fallbackAudio.currentTime = 0;

            void fallbackAudio.play().then(() => {
                pendingAlertPlaybackRef.current = false;
            }).catch(() => {});
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
            }).catch(() => {});
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
