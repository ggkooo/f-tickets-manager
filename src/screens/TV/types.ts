export interface TvTicket {
    id: number;
    key: string;
    serviceType: string;
    createdAt: Date;
    updatedAt: Date;
    counterName: string;
    calledAt?: Date;
}

// 'video' plays directly (an uploaded file or a direct video link);
// 'youtube' renders as an embedded iframe.
export type TvMediaKind = 'video' | 'youtube';

export interface TvMedia {
    id: number;
    kind: TvMediaKind;
    url: string;
}