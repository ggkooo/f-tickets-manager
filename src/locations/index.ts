export type Institution = 'unilab' | 'cre';

export const INSTITUTIONS: readonly Institution[] = ['unilab', 'cre'];

const LOCATIONS_BY_INSTITUTION = {
    unilab: ['campus', 'centro'],
    cre: ['ijui', 'santa-rosa', 'panambi', 'tres-passos'],
} as const;

export type UnilabLocationSlug = (typeof LOCATIONS_BY_INSTITUTION.unilab)[number];
export type CreLocationSlug = (typeof LOCATIONS_BY_INSTITUTION.cre)[number];

export type LocationSlug = UnilabLocationSlug | CreLocationSlug;

export const DEFAULT_UNILAB_LOCATION: UnilabLocationSlug = 'campus';
export const DEFAULT_CRE_LOCATION: CreLocationSlug = 'ijui';

export const ROUTE_PREFIX_BY_INSTITUTION: Record<Institution, string> = {
    unilab: '/unilab',
    cre: '/cre',
};

export const PUBLIC_LOCATION_QUERY_PARAM = 'location';

const INSTITUTION_BY_LOCATION: Record<LocationSlug, Institution> = Object.entries(LOCATIONS_BY_INSTITUTION).reduce(
    (accumulator, [institution, locations]) => {
        (locations as readonly string[]).forEach((location) => {
            accumulator[location as LocationSlug] = institution as Institution;
        });

        return accumulator;
    },
    {} as Record<LocationSlug, Institution>,
);

export const isValidInstitution = (value?: string | null): value is Institution =>
    typeof value === 'string' && (INSTITUTIONS as readonly string[]).includes(value);

export const resolveInstitution = (location?: string | null): Institution | null => {
    if (typeof location !== 'string') {
        return null;
    }

    return INSTITUTION_BY_LOCATION[location.trim().toLowerCase() as LocationSlug] ?? null;
};

export const isValidLocation = (value: string, institution?: Institution): value is LocationSlug => {
    const resolvedInstitution = INSTITUTION_BY_LOCATION[value as LocationSlug];

    if (!resolvedInstitution) {
        return false;
    }

    return institution ? resolvedInstitution === institution : true;
};

export const normalizeLocation = (value?: string | null, institution?: Institution): LocationSlug | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim().toLowerCase();

    return isValidLocation(normalizedValue, institution) ? normalizedValue : null;
};

export const buildLocationBasePath = (location: LocationSlug) => {
    const institution = resolveInstitution(location) ?? 'unilab';

    return `${ROUTE_PREFIX_BY_INSTITUTION[institution]}/${location}`;
};

export const buildLocationPath = (location: LocationSlug, suffix = '') => {
    const normalizedSuffix = suffix.replace(/^\/+/, '');

    return normalizedSuffix.length > 0
        ? `${buildLocationBasePath(location)}/${normalizedSuffix}`
        : buildLocationBasePath(location);
};

export const buildLocationHomePath = (location: LocationSlug) => buildLocationPath(location);

export const buildLocationTvPath = (location: LocationSlug) => buildLocationPath(location, 'tv');

export const buildLocationLoginPath = (location: LocationSlug) => buildLocationPath(location, 'login');

export const buildLocationAttendantPath = (location: LocationSlug) => buildLocationPath(location, 'attendent');

export const buildLocationAdminPath = (location: LocationSlug) => buildLocationPath(location, 'admin');

export const withLocationQuery = (path: string, location: LocationSlug) => {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}${PUBLIC_LOCATION_QUERY_PARAM}=${encodeURIComponent(location)}`;
};
