import { useEffect } from 'react';
import type { LocationSlug } from '../locations';
import { getEcho } from '../services/echo';

/**
 * Subscribes to the public `tickets.{location}` channel and calls `onUpdate`
 * whenever the backend broadcasts a `TicketsUpdated` signal for it (ticket
 * created/called/recalled/completed/canceled — see Ticket::booted() on the
 * backend). The event carries no data on purpose: `onUpdate` is expected to
 * be the same fetch function each screen already polls with, so there's a
 * single source of truth for what the data actually looks like.
 *
 * This is push, not a replacement for polling entirely — callers should
 * keep a long-interval fallback poll alongside this, in case the socket
 * silently drops on an unattended kiosk.
 */
export const useTicketRealtime = (location: LocationSlug | null, onUpdate: () => void) => {
    useEffect(() => {
        if (!location) {
            return;
        }

        const channelName = `tickets.${location}`;
        const channel = getEcho().channel(channelName);
        channel.listen('.TicketsUpdated', onUpdate);

        return () => {
            getEcho().leaveChannel(channelName);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
};
