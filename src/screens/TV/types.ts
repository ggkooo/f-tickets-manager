export interface TvTicket {
    id: number;
    key: string;
    serviceType: string;
    createdAt: Date;
    updatedAt: Date;
    counterName: string;
    calledAt?: Date;
}

// 'video' plays directly (an uploaded file or a direct video-file link);
// 'youtube' renders as an embedded iframe with autoplay/mute/loop params;
// 'embed' is any other link (a webpage, not a raw video file) rendered as a
// plain iframe — we can't control mute/loop/ended on that page's content.
export type TvMediaKind = 'video' | 'youtube' | 'embed';

export interface TvMedia {
    id: number;
    kind: TvMediaKind;
    url: string;
}