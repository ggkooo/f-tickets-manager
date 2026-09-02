import React, { useRef } from 'react';
import type { ApiVideo } from '../../../services/adminService';

interface VideoManagementCardProps {
    videos: ApiVideo[];
    linkUrl: string;
    isLoadingVideos: boolean;
    isUploadingVideo: boolean;
    isAddingLink: boolean;
    deletingVideoId: number | null;
    errorMessage: string | null;
    successMessage: string | null;
    onLinkUrlChange: (value: string) => void;
    onUploadVideo: (file: File) => Promise<void>;
    onAddLink: (e: React.FormEvent) => Promise<void>;
    onDeleteVideo: (videoId: number) => Promise<void>;
    onReload: () => Promise<void>;
}

const describeVideo = (video: ApiVideo): string => {
    if (video.type === 'upload') {
        return video.filename ?? `Vídeo #${video.id}`;
    }

    return video.url ?? `Vídeo #${video.id}`;
};

const VideoManagementCard: React.FC<VideoManagementCardProps> = ({
    videos,
    linkUrl,
    isLoadingVideos,
    isUploadingVideo,
    isAddingLink,
    deletingVideoId,
    errorMessage,
    successMessage,
    onLinkUrlChange,
    onUploadVideo,
    onAddLink,
    onDeleteVideo,
    onReload,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (file) {
            void onUploadVideo(file);
        }
    };

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg lg:p-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Vídeos da TV</h2>
                    <p className="text-sm text-slate-500">
                        Envie um arquivo de vídeo ou adicione um link (YouTube ou outro), exibidos apenas na TV desta localização.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void onReload()}
                    disabled={isLoadingVideos}
                    className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoadingVideos ? 'Atualizando...' : 'Atualizar'}
                </button>
            </div>

            {errorMessage ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div> : null}
            {successMessage ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</div> : null}

            <div className="space-y-3">
                {videos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                        Nenhum vídeo cadastrado para esta localização. A TV mostra a logo da Unijuí enquanto isso.
                    </div>
                ) : null}

                {videos.map((video) => (
                    <div
                        key={video.id}
                        className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-4"
                    >
                        <div className="min-w-0">
                            <span className="mb-1 inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                                {video.type === 'upload' ? 'Arquivo' : 'Link'}
                            </span>
                            <p className="truncate text-sm font-semibold text-slate-800">{describeVideo(video)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void onDeleteVideo(video.id)}
                            disabled={deletingVideoId === video.id}
                            className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deletingVideoId === video.id ? 'Removendo...' : 'Remover'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid gap-6 border-t border-slate-200 pt-8 md:grid-cols-2">
                <div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">Enviar arquivo</h3>
                    <p className="mb-3 text-sm text-slate-500">Formato aceito: .mp4</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4"
                        onChange={handleFileChange}
                        disabled={isUploadingVideo}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-sm file:font-bold file:text-white file:transition hover:file:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    {isUploadingVideo ? <p className="mt-2 text-sm font-semibold text-slate-500">Enviando vídeo...</p> : null}
                </div>

                <div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">Adicionar link</h3>
                    <p className="mb-3 text-sm text-slate-500">
                        Link do YouTube, um link direto de arquivo de vídeo (.mp4) ou uma página que permita ser
                        incorporada em outro site. Páginas comuns costumam bloquear isso — se não carregar na TV,
                        prefira o link direto do vídeo ou envie o arquivo ao lado.
                    </p>
                    <form onSubmit={(e) => void onAddLink(e)} className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => onLinkUrlChange(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={isAddingLink}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <button
                            type="submit"
                            disabled={isAddingLink}
                            className="shrink-0 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {isAddingLink ? 'Adicionando...' : 'Adicionar'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default VideoManagementCard;
