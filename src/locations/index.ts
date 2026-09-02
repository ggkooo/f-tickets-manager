/**
 * Every totem in the system belongs to an "institution" (unit) — Unilab or
 * CRE — and every institution has one or more physical locations (campi).
 * Location slugs are unique across institutions, which lets most of the
 * app (services, session, path builders) keep working with a single
 * `location` string without needing to also thread the institution through
 * every call site: given a location we can always look up its institution.
 */
export type Institution = 'unilab' | 'cre';

export const INSTITUTIONS: readonly Institution[] = ['unilab', 'cre'];

const LOCATIONS_BY_INSTITUTION = {
    unilab: ['campus', 'centro'],
    cre: ['ijui', 'santa-rosa', 'panambi', 'tres-passos'],
} as const;

export type UnilabLocationSlug = (typeof LOCATIONS_BY_INSTITUTION.unilab)[number];
export type CreLocationSlug = (typeof LOCATIONS_BY_INSTITUTION.cre)[number];

/** Any valid totem location slug, regardless of institution. */
export type LocationSlug = UnilabLocationSlug | CreLocationSlug;

export const DEFAULT_UNILAB_LOCATION: UnilabLocationSlug = 'campus';
export const DEFAULT_CRE_LOCATION: CreLocationSlug = 'ijui';

export const DEFAULT_LOCATION_BY_INSTITUTION: Record<Institution, LocationSlug> = {
    unilab: DEFAULT_UNILAB_LOCATION,
    cre: DEFAULT_CRE_LOCATION,
};

export const ROUTE_PREFIX_BY_INSTITUTION: Record<Institution, string> = {
    unilab: '/unilab',
    cre: '/cre',
};

export const PUBLIC_LOCATION_QUERY_PARAM = 'location';

const LOCATION_LABELS: Record<LocationSlug, string> = {
    campus: 'Unilab Campus',
    centro: 'Unilab Centro',
    ijui: 'CRE Ijuí',
    'santa-rosa': 'CRE Santa Rosa',
    panambi: 'CRE Panambi',
    'tres-passos': 'CRE Três Passos',
};

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

export const normalizeInstitution = (value?: string | null): Institution | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim().toLowerCase();

    return isValidInstitution(normalizedValue) ? normalizedValue : null;
};

/** Given a location slug, returns the institution it belongs to (or null if unknown). */
export const resolveInstitution = (location?: string | null): Institution | null => {
    if (typeof location !== 'string') {
        return null;
    }

    return INSTITUTION_BY_LOCATION[location.trim().toLowerCase() as LocationSlug] ?? null;
};

/**
 * Validates a location slug. When `institution` is given, the location must
 * also belong to that institution (used to keep `/unilab/:location` and
 * `/cre/:location` routes from accepting each other's slugs).
 */
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

export const getLocationLabel = (value?: string | null): string => {
    const normalizedValue = normalizeLocation(value);

    return LOCATION_LABELS[normalizedValue ?? DEFAULT_UNILAB_LOCATION];
};

export const locationOptions = (institution: Institution) =>
    LOCATIONS_BY_INSTITUTION[institution].map((location) => ({
        value: location as LocationSlug,
        label: LOCATION_LABELS[location as LocationSlug],
    }));

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
