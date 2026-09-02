import { useState } from 'react';
import { fetchAttendanceReport } from '../../../services/adminService';
import { resolveInstitution, type LocationSlug } from '../../../locations';
import { createAttendanceReportPdf } from '../reportPdf';

/**
 * Owns the date range and PDF export for the "Exportação de dados" card.
 */
export const useAttendanceReport = (accessToken: string | undefined, userLocation: LocationSlug | undefined) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [reportSuccess, setReportSuccess] = useState<string | null>(null);

    const handleDownloadReport = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            setReportError('Informe a data inicial e a data final.');
            return;
        }

        setIsDownloadingReport(true);
        setReportError(null);
        setReportSuccess(null);

        try {
            const reportData = await fetchAttendanceReport(startDate, endDate, accessToken);
            const institutionLabel = resolveInstitution(userLocation) === 'cre' ? 'CRE' : 'UNILAB';

            createAttendanceReportPdf(reportData, institutionLabel);
            setReportSuccess('PDF gerado com sucesso.');
        } catch (error) {
            setReportError(error instanceof Error ? error.message : 'Falha ao gerar PDF.');
        } finally {
            setIsDownloadingReport(false);
        }
    };

    return {
        startDate,
        endDate,
        reportError,
        reportSuccess,
        isDownloadingReport,
        setStartDate,
        setEndDate,
        handleDownloadReport,
    };
};
