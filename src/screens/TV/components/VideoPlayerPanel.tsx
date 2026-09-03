import type { RefObject } from 'react';
import React from 'react';
import unijuiLogo from '../../../assets/logo-unijui.png';
import type { TvMedia } from '../types';
import { enforceSilentVideoPlayback } from '../hooks/useSilentVideoPlayback';

interface VideoPlayerPanelProps {
    media: TvMedia | null;
    hasMultipleItems: boolean;
    error: string | null;
    videoRef: RefObject<HTMLVideoElement | null>;
    onVideoEnded: () => void;
    reloadNonce: number;
}

const VideoPlayerPanel: React.FC<VideoPlayerPanelProps> = ({ media, hasMultipleItems, error, videoRef, onVideoEnded, reloadNonce }) => {
    return (
        <div className="flex-[1.15] min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] xl:min-h-[260px] 2xl:min-h-[300px] flex flex-col justify-end">
            <div className="w-full bg-blue-100/40 rounded-xl lg:rounded-2xl shadow-inner p-2 sm:p-2.5 flex justify-center items-center border border-blue-200 h-full min-h-0">
                {error ? (
                    <span className="text-red-500 text-[clamp(1rem,1.2vw,1.4rem)] text-center px-6">{error}</span>
                ) : media?.kind === 'video' ? (
                    <video
                        ref={(el) => {
                            (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                            enforceSilentVideoPlayback(el);
                        }}
                        key={media.id}
                        className="rounded-lg lg:rounded-xl w-full h-full object-cover min-h-[140px] max-h-[30vh] lg:max-h-[34vh] xl:max-h-[42vh] 2xl:max-h-[46vh]"
                        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                        src={media.url}
                        autoPlay
                        muted
                        loop={!hasMultipleItems}
                        playsInline
                        onLoadedMetadata={(event) => enforceSilentVideoPlayback(event.currentTarget)}
                        onPlay={(event) => enforceSilentVideoPlayback(event.currentTarget)}
                        onVolumeChange={(event) => enforceSilentVideoPlayback(event.currentTarget)}
                        onEnded={onVideoEnded}
                        onPause={(event) => {
                            if (!hasMultipleItems) {
                                void event.currentTarget.play();
                            }
                        }}
                    />
                ) : media?.kind === 'youtube' ? (
                    <iframe
                        key={media.id}
                        className="rounded-lg lg:rounded-xl w-full h-full min-h-[140px] max-h-[30vh] lg:max-h-[34vh] xl:max-h-[42vh] 2xl:max-h-[46vh]"
                        src={media.url}
                        title="Vídeo institucional"
                        allow="autoplay; encrypted-media"
                        frameBorder={0}
                    />
                ) : media?.kind === 'embed' ? (
                    <iframe
                        key={`${media.id}-${reloadNonce}`}
                        className="rounded-lg lg:rounded-xl w-full h-full min-h-[140px] max-h-[30vh] lg:max-h-[34vh] xl:max-h-[42vh] 2xl:max-h-[46vh]"
                        src={media.url}
                        title="Vídeo institucional"
                        allow="autoplay"
                        frameBorder={0}
                    />
                ) : (
                    <div className="w-full h-full min-h-[140px] max-h-[30vh] lg:max-h-[34vh] xl:max-h-[42vh] 2xl:max-h-[46vh] rounded-lg lg:rounded-xl bg-white flex items-center justify-center">
                        <img src={unijuiLogo} alt="Unijuí" className="w-1/3 max-w-[140px] object-contain opacity-90" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayerPanel;
