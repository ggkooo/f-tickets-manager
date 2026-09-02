import { DEFAULT_UNILAB_LOCATION, buildLocationLoginPath } from '../locations';
import { clearAuthSession, getUserLocation } from './session';

/**
 * Bearer tokens now expire server-side (see config/sanctum.php on the API).
 * Call this wherever an authenticated request comes back 401 so the
 * attendant/admin gets sent back to login instead of being stuck retrying
 * an action that will never succeed with a dead token.
 *
 * Uses a hard navigation (not react-router) since this runs inside plain
 * service functions, outside any component.
 */
export const handleExpiredSession = (): void => {
    const location = getUserLocation();

    clearAuthSession();

    window.location.href = buildLocationLoginPath(location ?? DEFAULT_UNILAB_LOCATION);
};
