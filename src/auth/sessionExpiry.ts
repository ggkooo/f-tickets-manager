import { DEFAULT_UNILAB_LOCATION, buildLocationLoginPath } from '../locations';
import { clearAuthSession, getUserLocation } from './session';

export const handleExpiredSession = (): void => {
    const location = getUserLocation();

    clearAuthSession();

    window.location.href = buildLocationLoginPath(location ?? DEFAULT_UNILAB_LOCATION);
};
