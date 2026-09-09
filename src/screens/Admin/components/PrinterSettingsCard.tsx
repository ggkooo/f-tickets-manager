import React from 'react';
import type { PrinterConnectionType } from '../../../services/adminService';
import type { PrinterFormState } from '../types';

type ManagedPrinterCard = {
    id: number;
    name: string;
};

interface PrinterSettingsCardProps {
    printers: ManagedPrinterCard[];
    form: PrinterFormState;
    editingPrinterId: number | null;
    isLoading: boolean;
    isSaving: boolean;
    errorMessage: string | null;
    successMessage: string | null;
    onPrinterFieldChange: <K extends keyof PrinterFormState>(field: K, value: PrinterFormState[K]) => void;
    onEditPrinter: (printerId: number) => void;
    onCancelEdit: () => void;
    onSubmit: () => Promise<void>;
    onReload: () => Promise<void>;
}

interface PrinterFormFieldsProps {
    form: PrinterFormState;
    disabled?: boolean;
    onFieldChange: <K extends keyof PrinterFormState>(field: K, value: PrinterFormState[K]) => void;
}

const PrinterFormFields: React.FC<PrinterFormFieldsProps> = ({ form, disabled = false, onFieldChange }) => {
    const isNetwork = form.connectionType === 'network';

    return (
        <>
            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nome da impressora</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                    placeholder="Ex.: Balcao 1"
                    disabled={disabled}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => onFieldChange('enabled', e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-slate-300"
                />
                Impressao habilitada
            </label>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tipo de conexao</label>
                <select
                    value={form.connectionType}
                    onChange={(e) => onFieldChange('connectionType', e.target.value as PrinterConnectionType)}
                    disabled={disabled}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="network">Impressora de rede</option>
                    <option value="shared_windows">Impressora compartilhada Windows</option>
                </select>
            </div>

            {isNetwork ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Host</label>
                        <input
                            type="text"
                            value={form.host}
                            onChange={(e) => onFieldChange('host', e.target.value)}
                            placeholder="Ex.: 10.0.0.25"
                            disabled={disabled}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Porta</label>
                        <input
                            type="number"
                            value={form.port}
                            onChange={(e) => onFieldChange('port', e.target.value)}
                            placeholder="9100"
                            disabled={disabled}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Caminho UNC (share_path)</label>
                    <input
                        type="text"
                        value={form.sharePath}
                        onChange={(e) => onFieldChange('sharePath', e.target.value)}
                        placeholder="\\\\200.132.194.29\\EPSON-TM-T20X"
                        disabled={disabled}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Profile</label>
                    <input
                        type="text"
                        value={form.profile}
                        onChange={(e) => onFieldChange('profile', e.target.value)}
                        placeholder="default"
                        disabled={disabled}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Header</label>
                    <input
                        type="text"
                        value={form.header}
                        onChange={(e) => onFieldChange('header', e.target.value)}
                        placeholder="SENHA DE ATENDIMENTO"
                        disabled={disabled}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>
            </div>
        </>
    );
};

const PrinterSettingsCard: React.FC<PrinterSettingsCardProps> = ({
    printers,
    form,
    editingPrinterId,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    onPrinterFieldChange,
    onEditPrinter,
    onCancelEdit,
    onSubmit,
    onReload,
}) => {
    const isEditing = editingPrinterId !== null;

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg lg:p-8">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Configuracao de impressoras</h2>
                    <p className="text-sm text-slate-500">Veja as impressoras cadastradas e use o formulario abaixo para adicionar ou editar uma configuracao.</p>
                </div>
                <button
                    type="button"
                    onClick={() => void onReload()}
                    disabled={isLoading}
                    className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? 'Atualizando...' : 'Atualizar'}
                </button>
            </div>

            {errorMessage ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div> : null}
            {successMessage ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</div> : null}

            <div className="space-y-4">
                {printers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                        Nenhuma impressora cadastrada para esta localizacao.
                    </div>
                ) : null}

                {printers.map((printer) => (
                    <div
                        key={printer.id}
                        className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5"
                    >
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-slate-900">{printer.name.trim() || `Impressora #${printer.id}`}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => onEditPrinter(printer.id)}
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
                        >
                            Editar
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Editar impressora' : 'Cadastrar nova impressora'}</h3>
                        <p className="text-sm text-slate-500">
                            {isEditing
                                ? 'Ajuste os dados da impressora selecionada e salve as alteracoes.'
                                : 'Preencha os dados abaixo para adicionar uma nova configuracao de impressora.'}
                        </p>
                    </div>
                    {isEditing ? (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar edicao
                        </button>
                    ) : null}
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void onSubmit();
                    }}
                    className="space-y-4"
                >
                    <PrinterFormFields form={form} disabled={isSaving} onFieldChange={onPrinterFieldChange} />

                    <div className="flex flex-col gap-3 md:flex-row">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {isSaving ? 'Salvando...' : isEditing ? 'Salvar alteracoes' : 'Adicionar impressora'}
                        </button>
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={onCancelEdit}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Limpar formulario
                            </button>
                        ) : null}
                    </div>
                </form>
            </div>
        </section>
    );
};

export default PrinterSettingsCard;
