import type { PrinterConnectionType } from '../../services/adminService';

export interface UserFormState {
    name: string;
    login: string;
    password: string;
    active: boolean;
    is_admin: boolean;
}

export interface RegisterUserFormState {
    name: string;
    login: string;
    password: string;
    passwordConfirmation: string;
}

export interface ConfirmDialogConfig {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
}

export interface PrinterFormState {
    name: string;
    enabled: boolean;
    connectionType: PrinterConnectionType;
    host: string;
    port: string;
    sharePath: string;
    profile: string;
    header: string;
}

export const emptyUserForm: UserFormState = {
    name: '',
    login: '',
    password: '',
    active: true,
    is_admin: false,
};

export const emptyRegisterUserForm: RegisterUserFormState = {
    name: '',
    login: '',
    password: '',
    passwordConfirmation: '',
};

export const createEmptyPrinterForm = (): PrinterFormState => ({
    name: '',
    enabled: true,
    connectionType: 'network',
    host: '',
    port: '9100',
    sharePath: '',
    profile: 'default',
    header: 'SENHA DE ATENDIMENTO',
});
