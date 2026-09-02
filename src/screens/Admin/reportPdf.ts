import { jsPDF } from 'jspdf';
import type { AttendanceReportResponse } from '../../services/adminService';

const formatDayLabel = (value: string): string => {
    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    });
};

const formatReportTypeLabel = (value: string): string => {
    if (value === 'priority') {
        return 'Preferencial';
    }

    if (value === 'others') {
        return 'Outros';
    }

    return value.replace(/_/g, ' ');
};

const formatOutcomeLabel = (value: string): string => {
    if (value === 'completed') {
        return 'Concluído';
    }

    if (value === 'canceled') {
        return 'Cancelado';
    }

    if (value === 'unknown') {
        return 'Não informado';
    }

    return value.replace(/_/g, ' ');
};

export const createAttendanceReportPdf = (report: AttendanceReportResponse, institutionLabel = 'UNILAB'): void => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const usableWidth = pageWidth - margin * 2;

    const drawCard = (x: number, y: number, width: number, height: number, title: string, value: string, accent: [number, number, number]) => {
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(x, y, width, height, 4, 4, 'F');
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.roundedRect(x, y, 3, height, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(10);
        pdf.text(title, x + 8, y + 8);
        pdf.setFontSize(18);
        pdf.setTextColor(15, 23, 42);
        pdf.text(value, x + 8, y + 18);
    };

    const drawDistributionSection = (
        title: string,
        entries: Array<[string, number]>,
        labelFormatter: (value: string) => string,
        y: number,
        colors: Array<[number, number, number]>,
    ) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(15, 23, 42);
        pdf.text(title, margin, y);

        const boxY = y + 8;
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, boxY, usableWidth, 56, 4, 4);

        if (entries.length === 0) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Nenhum dado encontrado no período.', margin + 8, boxY + 18);
            return boxY + 56 + 10;
        }

        const maxValue = Math.max(1, ...entries.map(([, value]) => value));
        let rowY = boxY + 12;

        entries.forEach(([key, value], index) => {
            const color = colors[index % colors.length];
            const label = labelFormatter(key);
            const barMaxWidth = usableWidth - 78;
            const barWidth = (value / maxValue) * barMaxWidth;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(51, 65, 85);
            pdf.text(label, margin + 8, rowY);
            pdf.setFillColor(241, 245, 249);
            pdf.roundedRect(margin + 38, rowY - 4, barMaxWidth, 6, 2, 2, 'F');
            pdf.setFillColor(color[0], color[1], color[2]);
            pdf.roundedRect(margin + 38, rowY - 4, Math.max(4, barWidth), 6, 2, 2, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(15, 23, 42);
            pdf.text(String(value), margin + 38 + barMaxWidth + 6, rowY);
            rowY += 14;
        });

        return boxY + 56 + 10;
    };

    const ensurePageSpace = (cursorY: number, requiredHeight: number) => {
        if (cursorY + requiredHeight <= pageHeight - 18) {
            return cursorY;
        }

        pdf.addPage();
        return 24;
    };

    const drawGuicheSection = (y: number) => {
        const guicheEntries = report.attendances_by_guiche ?? [];
        let sectionY = ensurePageSpace(y, 40);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Atendimentos por guichê', margin, sectionY);
        sectionY += 8;

        if (guicheEntries.length === 0) {
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(margin, sectionY, usableWidth, 24, 4, 4);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Nenhum dado de guichê encontrado no período.', margin + 8, sectionY + 14);
            return sectionY + 34;
        }

        const maxTotal = Math.max(1, ...guicheEntries.map((entry) => entry.total));

        guicheEntries.forEach((entry, index) => {
            sectionY = ensurePageSpace(sectionY, 36);

            const cardY = sectionY;
            const accentColors: Array<[number, number, number]> = [
                [37, 99, 235],
                [59, 130, 246],
                [29, 78, 216],
                [30, 64, 175],
            ];
            const accent = accentColors[index % accentColors.length];

            pdf.setDrawColor(226, 232, 240);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(margin, cardY, usableWidth, 30, 4, 4, 'FD');
            pdf.setFillColor(accent[0], accent[1], accent[2]);
            pdf.roundedRect(margin, cardY, 3, 30, 2, 2, 'F');

            const title = `${entry.guiche} (${entry.attended_by_user_login})`;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(30, 41, 59);
            pdf.text(title, margin + 8, cardY + 7);

            const barX = margin + 8;
            const barY = cardY + 11;
            const barWidth = usableWidth - 34;
            const fillWidth = Math.max(4, (entry.total / maxTotal) * barWidth);

            pdf.setFillColor(226, 232, 240);
            pdf.roundedRect(barX, barY, barWidth, 6, 2, 2, 'F');
            pdf.setFillColor(accent[0], accent[1], accent[2]);
            pdf.roundedRect(barX, barY, fillWidth, 6, 2, 2, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(15, 23, 42);
            pdf.text(String(entry.total), barX + barWidth + 4, barY + 4);

            const statsY = cardY + 24;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(51, 65, 85);
            pdf.text(`Concluídos: ${entry.completed}`, margin + 8, statsY);
            pdf.text(`Cancelados: ${entry.canceled}`, margin + 56, statsY);
            pdf.text(`Não informados: ${entry.unknown}`, margin + 100, statsY);

            sectionY += 36;
        });

        return sectionY;
    };

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 34, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('Relatório de Atendimentos', margin, 14);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Período: ${report.period.start_date} até ${report.period.end_date}`, margin, 22);
    pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, 28);

    let cursorY = 42;
    const cardGap = 6;
    const cardWidth = (usableWidth - cardGap) / 2;

    drawCard(margin, cursorY, cardWidth, 24, 'Total de atendimentos', String(report.total_attendances), [37, 99, 235]);
    drawCard(margin + cardWidth + cardGap, cursorY, cardWidth, 24, 'Tempo médio de espera', report.average_wait_time.formatted, [5, 150, 105]);
    cursorY += 30;
    drawCard(margin, cursorY, cardWidth, 24, 'Média por dia', report.average_attendances_per_day.toFixed(1), [234, 88, 12]);
    drawCard(margin + cardWidth + cardGap, cursorY, cardWidth, 24, 'Dias analisados', String(report.period.days), [139, 92, 246]);
    cursorY += 34;

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Atendimentos por dia', margin, cursorY);
    cursorY += 6;

    const dayEntries = Object.entries(report.attendances_per_day);
    const chartX = margin;
    const chartY = cursorY + 4;
    const chartWidth = usableWidth;
    const chartHeight = 46;
    const maxDayValue = Math.max(1, ...dayEntries.map(([, value]) => value));

    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(chartX, chartY, chartWidth, chartHeight, 4, 4);

    if (dayEntries.length === 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Nenhum dado diário encontrado no período.', chartX + 8, chartY + 20);
    } else {
        const barGap = 6;
        const innerWidth = chartWidth - 16;
        const barWidth = Math.max(12, (innerWidth - barGap * (dayEntries.length - 1)) / dayEntries.length);
        const totalBarsWidth = barWidth * dayEntries.length + barGap * (dayEntries.length - 1);
        let barX = chartX + (chartWidth - totalBarsWidth) / 2;

        dayEntries.forEach(([day, value]) => {
            const barHeight = (value / maxDayValue) * 26;
            const barY = chartY + 32 - barHeight;
            pdf.setFillColor(37, 99, 235);
            pdf.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(15, 23, 42);
            pdf.text(String(value), barX + barWidth / 2, barY - 2, { align: 'center' });
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(71, 85, 105);
            pdf.text(formatDayLabel(day), barX + barWidth / 2, chartY + 39, { align: 'center' });
            barX += barWidth + barGap;
        });
    }

    cursorY = chartY + chartHeight + 12;
    const typeEntries = Object.entries(report.attendances_by_type);
    const typeColors: Array<[number, number, number]> = [
        [245, 158, 11],
        [16, 185, 129],
        [59, 130, 246],
        [239, 68, 68],
    ];

    cursorY = drawDistributionSection('Distribuição por tipo', typeEntries, formatReportTypeLabel, cursorY, typeColors);

    const outcomeEntries = Object.entries(report.attendances_by_outcome ?? {});
    const outcomeColors: Array<[number, number, number]> = [
        [16, 185, 129],
        [244, 63, 94],
        [100, 116, 139],
        [59, 130, 246],
    ];

    cursorY = ensurePageSpace(cursorY, 74);

    cursorY = drawDistributionSection('Distribuição por desfecho', outcomeEntries, formatOutcomeLabel, cursorY, outcomeColors);
    cursorY = drawGuicheSection(cursorY + 2);

    const footerY = pageHeight - 10;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${institutionLabel} Totem Relatório administrativo gerado automaticamente`, margin, footerY);

    pdf.save(`relatorio-atendimentos-${report.period.start_date}-${report.period.end_date}.pdf`);
};
