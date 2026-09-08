import { useEffect, useState } from 'react';
import type { LocationSlug } from '../../../locations';
import { fetchTvMedia } from '../../../services/tvService';
import type { TvMedia } from '../types';
import { getMediaSignature } from '../utils';

const MEDIA_REFRESH_INTERVAL_MS = 30000;
const IFRAME_DISPLAY_DURATION_MS = 60000;

const isIframeMedia = (media: TvMedia | undefined): boolean =>
    media?.kind === 'youtube' || media?.kind === 'embed';

export const useTvMedia = (location: LocationSlug) => {
    const [mediaItems, setMediaItems] = useState<TvMedia[]>([]);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [reloadNonce, setReloadNonce] = useState(0);

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
            const nextMedia = await fetchTvMedia(location);

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
    }, [location]);

    useEffect(() => {
        const currentMedia = mediaItems[currentMediaIndex];

        if (!isIframeMedia(currentMedia)) {
            return;
        }

        if (mediaItems.length <= 1 && currentMedia?.kind === 'youtube') {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            if (mediaItems.length > 1) {
                advanceToNextMedia();
            } else {
                setReloadNonce((nonce) => nonce + 1);
            }
        }, IFRAME_DISPLAY_DURATION_MS);

        return () => window.clearTimeout(timeoutId);
    }, [currentMediaIndex, mediaItems]);

    return {
        mediaItems,
        mediaError,
        currentMediaIndex,
        reloadNonce,
        advanceToNextMedia,
    };
};
