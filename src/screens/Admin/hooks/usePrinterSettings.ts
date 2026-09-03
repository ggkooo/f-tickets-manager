import { useEffect, useState } from 'react';
import {
    createPrinterSettings,
    fetchPrinterSettings,
    type PrinterSettingsResponse,
    updatePrinterSettings,
} from '../../../services/adminService';
import { createEmptyPrinterForm, type PrinterFormState } from '../types';

type ManagedPrinterForm = {
    id: number;
    form: PrinterFormState;
};

const mapPrinterSettingsToForm = (settings: PrinterSettingsResponse): PrinterFormState => ({
    name: settings.name ?? '',
    enabled: settings.enabled ?? true,
    connectionType: settings.connection_type ?? 'network',
    host: settings.host ?? '',
    port: String(settings.port ?? 9100),
    sharePath: settings.share_path ?? '',
    profile: settings.profile ?? 'simple',
    header: settings.header ?? 'SENHA DE ATENDIMENTO',
});

const validatePrinterForm = (form: PrinterFormState) => {
    if (!form.name.trim()) {
        return 'Informe um nome para a impressora.';
    }

    if (form.connectionType === 'network' && !form.host.trim()) {
        return 'Host e obrigatorio para impressora de rede.';
    }

    if (form.connectionType === 'shared_windows' && !form.sharePath.trim()) {
        return 'share_path e obrigatorio para impressora compartilhada no Windows.';
    }

    const normalizedPort = Number(form.port || '9100');

    if (form.connectionType === 'network' && (!Number.isFinite(normalizedPort) || normalizedPort <= 0)) {
        return 'Informe uma porta valida para impressora de rede.';
    }

    return null;
};

const buildPrinterPayload = (form: PrinterFormState) => {
    const normalizedPort = Number(form.port || '9100');

    return {
        name: form.name.trim(),
        enabled: form.enabled,
        connection_type: form.connectionType,
        host: form.connectionType === 'network' ? form.host.trim() : undefined,
        port: form.connectionType === 'network' ? normalizedPort : undefined,
        share_path: form.connectionType === 'shared_windows' ? form.sharePath.trim() : undefined,
        profile: form.profile.trim() || 'simple',
        header: form.header.trim() || 'SENHA DE ATENDIMENTO',
    };
};

export const usePrinterSettings = (accessToken: string | undefined, enabled: boolean) => {
    const [printerForms, setPrinterForms] = useState<ManagedPrinterForm[]>([]);
    const [printerForm, setPrinterForm] = useState<PrinterFormState>(createEmptyPrinterForm());
    const [editingPrinterId, setEditingPrinterId] = useState<number | null>(null);

    const [isLoadingPrinterSettings, setIsLoadingPrinterSettings] = useState(false);
    const [isSavingPrinterForm, setIsSavingPrinterForm] = useState(false);

    const [printerError, setPrinterError] = useState<string | null>(null);
    const [printerSuccess, setPrinterSuccess] = useState<string | null>(null);

    const refreshPrinterSettings = async () => {
        if (!enabled) {
            return;
        }

        setIsLoadingPrinterSettings(true);
        setPrinterError(null);

        try {
            const settings = await fetchPrinterSettings(accessToken);

            setPrinterForms(settings.data.map((item) => ({ id: item.id, form: mapPrinterSettingsToForm(item) })));
        } catch (error) {
            setPrinterError(error instanceof Error ? error.message : 'Falha ao carregar configuracao da impressora.');
        } finally {
            setIsLoadingPrinterSettings(false);
        }
    };

    useEffect(() => {
        if (!enabled) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPrinterForms([]);
            setPrinterForm(createEmptyPrinterForm());
            setEditingPrinterId(null);
            return;
        }

        void refreshPrinterSettings();
    }, [enabled]);

    const handlePrinterFieldChange = <K extends keyof PrinterFormState>(field: K, value: PrinterFormState[K]) => {
        setPrinterForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        setPrinterError(null);
        setPrinterSuccess(null);
    };

    const handleEditPrinter = (printerId: number) => {
        const selectedPrinter = printerForms.find((printer) => printer.id === printerId);

        if (!selectedPrinter) {
            return;
        }

        setEditingPrinterId(printerId);
        setPrinterForm(selectedPrinter.form);
        setPrinterError(null);
        setPrinterSuccess(null);
    };

    const handleCancelPrinterEdit = () => {
        setEditingPrinterId(null);
        setPrinterForm(createEmptyPrinterForm());
        setPrinterError(null);
        setPrinterSuccess(null);
    };

    const handleSubmitPrinterForm = async () => {
        const validationError = validatePrinterForm(printerForm);

        if (validationError) {
            setPrinterError(validationError);
            return;
        }

        setIsSavingPrinterForm(true);
        setPrinterError(null);
        setPrinterSuccess(null);

        try {
            if (editingPrinterId !== null) {
                const saved = await updatePrinterSettings(editingPrinterId, buildPrinterPayload(printerForm), accessToken);

                setPrinterForms((prev) => prev.map((printer) => (printer.id === editingPrinterId ? { id: saved.id, form: mapPrinterSettingsToForm(saved) } : printer)));
                setPrinterForm(mapPrinterSettingsToForm(saved));
                setPrinterSuccess('Configuracao da impressora salva com sucesso.');
                return;
            }

            const created = await createPrinterSettings(buildPrinterPayload(printerForm), accessToken);

            setPrinterForms((prev) => [...prev, { id: created.id, form: mapPrinterSettingsToForm(created) }]);
            setPrinterForm(createEmptyPrinterForm());
            setPrinterSuccess('Impressora cadastrada com sucesso.');
        } catch (error) {
            setPrinterError(error instanceof Error ? error.message : 'Falha ao salvar configuracao da impressora.');
        } finally {
            setIsSavingPrinterForm(false);
        }
    };

    return {
        printerForms,
        printerForm,
        editingPrinterId,
        isLoadingPrinterSettings,
        isSavingPrinterForm,
        printerError,
        printerSuccess,
        refreshPrinterSettings,
        handlePrinterFieldChange,
        handleEditPrinter,
        handleCancelPrinterEdit,
        handleSubmitPrinterForm,
    };
};
