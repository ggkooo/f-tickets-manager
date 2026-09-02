import { useEffect, useState } from 'react';
import { fetchAdminVideos } from '../../../services/adminService';

/**
 * Just the video count for the summary cards — the actual video management
 * UI lives elsewhere; this hook exists so SummaryCards has a number to show.
 */
export const useAdminVideos = (accessToken: string | undefined, enabled: boolean) => {
    const [videos, setVideos] = useState<{ filename: string; url: string; created_at?: string }[]>([]);

    const fetchVideos = async () => {
        if (!enabled) {
            return;
        }

        try {
            setVideos(await fetchAdminVideos(accessToken));
        } catch {
            setVideos([]);
        }
    };

    useEffect(() => {
        if (!enabled) {
            // Defensive reset for the (practically unreachable) case where
            // `enabled` flips to false after already being true.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVideos([]);
            return;
        }

        void fetchVideos();
    }, [enabled]);

    return { videos, fetchVideos };
};
