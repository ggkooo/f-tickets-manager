import { useEffect, useState } from 'react';
import type { LocationSlug } from '../../../locations';
import { fetchTvMedia } from '../../../services/tvService';
import type { TvMedia } from '../types';
import { getMediaSignature } from '../utils';

const MEDIA_REFRESH_INTERVAL_MS = 30000;
// Iframe-based media ('youtube' and 'embed') doesn't expose a DOM "ended"
// event the way a plain <video> does, so those advance on a fixed timer
// instead.
const IFRAME_DISPLAY_DURATION_MS = 60000;

const isIframeMedia = (media: TvMedia | undefined): boolean =>
    media?.kind === 'youtube' || media?.kind === 'embed';

/**
 * Owns the TV screen's video playlist for this location: polling for
 * uploads/links added or removed in the admin panel, and auto-advancing.
 * Plain videos advance on their own `ended` event (via `advanceToNextMedia`,
 * called by the caller). Iframe media advances on a fixed timer here since
 * there's no `ended` event to listen for: with more than one item it moves
 * to the next one, otherwise it forces the iframe to reload (`reloadNonce`)
 * so a single non-YouTube embed still "restarts" instead of going stale —
 * YouTube already loops on its own via the `loop`/`playlist` embed params.
 */
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

        // A single YouTube item already loops itself via its embed params;
        // nothing to do here for it.
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
