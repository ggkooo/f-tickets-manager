import { useEffect, useState } from 'react';
import {
    type ApiVideo,
    addAdminVideoLink,
    deleteAdminVideo,
    fetchAdminVideos,
    uploadAdminVideo,
} from '../../../services/adminService';

// Matches the backend's UploadVideoRequest max rule (5GB).
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024 * 1024;

/**
 * Owns the "Vídeos da TV" card: the list of videos (uploads + links)
 * registered for this location, and every action on them. Videos are
 * always scoped to the authenticated superadmin's own location on the
 * backend — there's no location picker here by design.
 */
export const useVideoManagement = (accessToken: string | undefined, enabled: boolean) => {
    const [videos, setVideos] = useState<ApiVideo[]>([]);
    const [linkUrl, setLinkUrl] = useState('');

    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [deletingVideoId, setDeletingVideoId] = useState<number | null>(null);

    const [videoError, setVideoError] = useState<string | null>(null);
    const [videoSuccess, setVideoSuccess] = useState<string | null>(null);

    const refreshVideos = async () => {
        if (!enabled) {
            return;
        }

        setIsLoadingVideos(true);
        setVideoError(null);

        try {
            setVideos(await fetchAdminVideos(accessToken));
        } catch (error) {
            setVideoError(error instanceof Error ? error.message : 'Falha ao carregar os vídeos.');
        } finally {
            setIsLoadingVideos(false);
        }
    };

    useEffect(() => {
        if (!enabled) {
            // Defensive reset for the (practically unreachable) case where
            // `enabled` flips to false after already being true.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVideos([]);
            return;
        }

        void refreshVideos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    const handleUploadVideo = async (file: File) => {
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            setVideoError('O vídeo excede o tamanho máximo permitido de 5GB.');
            return;
        }

        setIsUploadingVideo(true);
        setVideoError(null);
        setVideoSuccess(null);

        try {
            await uploadAdminVideo(file, accessToken);
            setVideoSuccess('Vídeo enviado com sucesso.');
            await refreshVideos();
        } catch (error) {
            setVideoError(error instanceof Error ? error.message : 'Falha ao enviar o vídeo.');
        } finally {
            setIsUploadingVideo(false);
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedUrl = linkUrl.trim();

        if (!trimmedUrl) {
            setVideoError('Informe um link de vídeo.');
            return;
        }

        setIsAddingLink(true);
        setVideoError(null);
        setVideoSuccess(null);

        try {
            await addAdminVideoLink(trimmedUrl, accessToken);
            setLinkUrl('');
            setVideoSuccess('Link adicionado com sucesso.');
            await refreshVideos();
        } catch (error) {
            setVideoError(error instanceof Error ? error.message : 'Falha ao adicionar o link.');
        } finally {
            setIsAddingLink(false);
        }
    };

    const handleDeleteVideo = async (videoId: number) => {
        setDeletingVideoId(videoId);
        setVideoError(null);
        setVideoSuccess(null);

        try {
            await deleteAdminVideo(videoId, accessToken);
            setVideoSuccess('Vídeo removido com sucesso.');
            await refreshVideos();
        } catch (error) {
            setVideoError(error instanceof Error ? error.message : 'Falha ao remover o vídeo.');
        } finally {
            setDeletingVideoId(null);
        }
    };

    return {
        videos,
        linkUrl,
        setLinkUrl,
        isLoadingVideos,
        isUploadingVideo,
        isAddingLink,
        deletingVideoId,
        videoError,
        videoSuccess,
        refreshVideos,
        handleUploadVideo,
        handleAddLink,
        handleDeleteVideo,
    };
};
