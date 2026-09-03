export interface TvTicket {
    id: number;
    key: string;
    serviceType: string;
    createdAt: Date;
    updatedAt: Date;
    counterName: string;
    calledAt?: Date;
}

export type TvMediaKind = 'video' | 'youtube' | 'embed';

export interface TvMedia {
    id: number;
    kind: TvMediaKind;
    url: string;
}