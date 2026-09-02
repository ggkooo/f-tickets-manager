import { useMemo } from 'react';
import { useLocation as useRouterLocation, useParams } from 'react-router-dom';
import { type Institution, normalizeLocation } from '.';

const resolveInstitutionFromPathname = (pathname: string): Institution | null => {
    if (pathname === '/cre' || pathname.startsWith('/cre/')) {
        return 'cre';
    }

    if (pathname === '/unilab' || pathname.startsWith('/unilab/')) {
        return 'unilab';
    }

    return null;
};

/** The institution (unilab | cre) implied by the current route, if any. */
export const useRouteInstitution = () => {
    const { pathname } = useRouterLocation();

    return useMemo(() => resolveInstitutionFromPathname(pathname), [pathname]);
};

/**
 * The `:location` route param, validated against the institution implied by
 * the current route (`/unilab/*` vs `/cre/*`). A location slug that belongs
 * to the wrong institution (e.g. a CRE campus under `/unilab/...`) is
 * rejected, returning null just like an unknown slug would.
 */
export const useRouteLocation = () => {
    const { location } = useParams();
    const institution = useRouteInstitution();

    return useMemo(
        () => normalizeLocation(location, institution ?? undefined),
        [location, institution],
    );
};
