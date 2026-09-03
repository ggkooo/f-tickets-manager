export const getSignature = <T>(items: T[], keyFn: (item: T) => string): string =>
    items.map(keyFn).join('|');
