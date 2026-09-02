import React from 'react';
import type { ConfirmDialogConfig } from '../types';

interface ConfirmActionDialogProps {
    dialog: ConfirmDialogConfig | null;
    isConfirmingAction: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
    dialog,
    isConfirmingAction,
    onClose,
    onConfirm,
}) => {
    if (!dialog) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
                <h3 id="confirm-dialog-title" className="text-xl font-bold text-slate-900">{dialog.title}</h3>
                <p id="confirm-dialog-message" className="mt-3 text-sm leading-relaxed text-slate-600">{dialog.message}</p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isConfirmingAction}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => void onConfirm()}
                        disabled={isConfirmingAction}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                        {isConfirmingAction ? 'Processando...' : dialog.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionDialog;
