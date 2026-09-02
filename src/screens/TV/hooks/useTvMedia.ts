import { useEffect, useState } from 'react';
import { fetchTvMedia } from '../../../services/tvService';
import type { TvMedia } from '../types';
import { getMediaSignature } from '../utils';

const MEDIA_REFRESH_INTERVAL_MS = 30000;
const IMAGE_DISPLAY_DURATION_MS = 10000;

/**
 * Owns the TV screen's background media playlist (videos/images fetched
 * from the server): polling for new/removed files and auto-advancing past
 * images after a fixed duration (videos advance on their own `ended` event,
 * handled by the caller via `advanceToNextMedia`).
 */
export const useTvMedia = () => {
    const [mediaItems, setMediaItems] = useState<TvMedia[]>([]);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const advanceToNextMedia = () => {
        setCurrentMediaIndex((previousIndex) => {
            if (mediaItems.length <= 1) {
                return 0;
            }

            return (previousIndex + 1) % mediaItems.length;
        });
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
            setMediaItems((previousMedia) => (previousMedia.length === 0 ? previousMedia : []));
            setCurrentMediaIndex(0);
        }
    };

    useEffect(() => {
        void refreshMedia();

        const interval = window.setInterval(() => {
            void refreshMedia();
        }, MEDIA_REFRESH_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const currentMedia = mediaItems[currentMediaIndex];

        if (currentMedia?.type !== 'image' || mediaItems.length <= 1) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            advanceToNextMedia();
        }, IMAGE_DISPLAY_DURATION_MS);

        return () => window.clearTimeout(timeoutId);
    }, [currentMediaIndex, mediaItems]);

    return {
        mediaItems,
        mediaError,
        currentMediaIndex,
        advanceToNextMedia,
    };
};
