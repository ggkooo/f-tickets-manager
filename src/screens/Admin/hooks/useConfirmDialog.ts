import { useState } from 'react';
import type { ConfirmDialogConfig } from '../types';

/**
 * Generic "are you sure?" dialog: call `open()` with what to show and what
 * to run on confirm, render `dialog`/`isConfirmingAction` in a
 * <ConfirmActionDialog>, wire its onClose/onConfirm to the handlers below.
 */
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
