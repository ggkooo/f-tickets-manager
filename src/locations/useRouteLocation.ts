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

export const useRouteInstitution = () => {
    const { pathname } = useRouterLocation();

    return useMemo(() => resolveInstitutionFromPathname(pathname), [pathname]);
};

export const useRouteLocation = () => {
    const { location } = useParams();
    const institution = useRouteInstitution();

    return useMemo(
        () => normalizeLocation(location, institution ?? undefined),
        [location, institution],
    );
};
