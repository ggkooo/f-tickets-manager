import { useState } from 'react';
import type { ConfirmDialogConfig } from '../types';

export const useConfirmDialog = () => {
    const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
    const [isConfirmingAction, setIsConfirmingAction] = useState(false);

    const open = (config: ConfirmDialogConfig) => {
        setDialog(config);
    };

    const handleClose = () => {
        if (isConfirmingAction) {
            return;
        }

        setDialog(null);
    };

    const handleConfirm = async () => {
        if (!dialog) {
            return;
        }

        setIsConfirmingAction(true);

        try {
            await dialog.onConfirm();
        } finally {
            setIsConfirmingAction(false);
            setDialog(null);
        }
    };

    return {
        dialog,
        isConfirmingAction,
        open,
        handleClose,
        handleConfirm,
    };
};
