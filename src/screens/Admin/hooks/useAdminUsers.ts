import React, { useEffect, useState } from 'react';
import {
    type ApiUser,
    deleteAdminUser,
    fetchAdminUsers,
    registerAdminUser,
    toggleUserAdminRole,
    updateAdminUser,
} from '../../../services/adminService';
import {
    emptyRegisterUserForm,
    emptyUserForm,
    type RegisterUserFormState,
    type UserFormState,
} from '../types';

/**
 * Owns the "Usuários" section of the admin panel: the user list, the
 * edit/register forms, and every action that mutates a user (save, delete,
 * promote/demote). Only fetches when `enabled` is true (the caller passes
 * `isSuperAdmin`, since regular admins don't see user management).
 */
export const useAdminUsers = (accessToken: string | undefined, enabled: boolean) => {
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
    const [registerUserForm, setRegisterUserForm] = useState<RegisterUserFormState>(emptyRegisterUserForm);

    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const [togglingAdminId, setTogglingAdminId] = useState<number | null>(null);

    const [usersError, setUsersError] = useState<string | null>(null);
    const [userSuccess, setUserSuccess] = useState<string | null>(null);

    const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

    const syncUserForm = (user: ApiUser | null) => {
        if (!user) {
            setUserForm(emptyUserForm);
            return;
        }

        setUserForm({
            name: user.name,
            login: user.login,
            password: '',
            active: user.active,
            is_admin: user.is_admin,
        });
    };

    const fetchUsers = async () => {
        if (!enabled) {
            return;
        }

        setIsLoadingUsers(true);
        setUsersError(null);

        try {
            const parsedUsers = await fetchAdminUsers(accessToken);
            setUsers(parsedUsers);

            if (parsedUsers.length === 0) {
                setSelectedUserId(null);
                syncUserForm(null);
                return;
            }

            if (selectedUserId === null) {
                setSelectedUserId(parsedUsers[0].id);
                syncUserForm(parsedUsers[0]);
                return;
            }

            const updatedUser = parsedUsers.find((item) => item.id === selectedUserId) ?? null;

            if (!updatedUser) {
                setSelectedUserId(parsedUsers[0].id);
                syncUserForm(parsedUsers[0]);
                return;
            }

            syncUserForm(updatedUser);
        } catch (error) {
            setUsersError(error instanceof Error ? error.message : 'Falha ao buscar usuários.');
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (!enabled) {
            // Defensive reset for the (practically unreachable) case where
            // `enabled` flips to false after already being true.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsers([]);
            setSelectedUserId(null);
            syncUserForm(null);
            setRegisterUserForm(emptyRegisterUserForm);
            setIsLoadingUsers(false);
            return;
        }

        void fetchUsers();
    }, [enabled]);

    const handleSelectUser = (user: ApiUser) => {
        setSelectedUserId(user.id);
        setUsersError(null);
        setUserSuccess(null);
        syncUserForm(user);
    };

    const handleUserFieldChange = <K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
        setUserForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRegisterFieldChange = <K extends keyof RegisterUserFormState>(field: K, value: RegisterUserFormState[K]) => {
        setRegisterUserForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRegisterUser = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = registerUserForm.name.trim();
        const trimmedLogin = registerUserForm.login.trim();

        if (!trimmedName || !trimmedLogin || !registerUserForm.password || !registerUserForm.passwordConfirmation) {
            setUsersError('Preencha nome, login, senha e confirmação de senha para cadastrar o usuário.');
            return;
        }

        if (registerUserForm.password !== registerUserForm.passwordConfirmation) {
            setUsersError('A confirmação de senha não confere.');
            return;
        }

        setIsCreatingUser(true);
        setUsersError(null);
        setUserSuccess(null);

        try {
            await registerAdminUser(
                {
                    name: trimmedName,
                    login: trimmedLogin,
                    password: registerUserForm.password,
                    password_confirmation: registerUserForm.passwordConfirmation,
                },
                accessToken,
            );

            setRegisterUserForm(emptyRegisterUserForm);
            setUserSuccess('Usuário cadastrado com sucesso.');
            await fetchUsers();
        } catch (error) {
            setUsersError(error instanceof Error ? error.message : 'Falha ao cadastrar usuário.');
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId) {
            setUsersError('Selecione um usuário para editar.');
            return;
        }

        setIsSavingUser(true);
        setUsersError(null);
        setUserSuccess(null);

        try {
            const payload: {
                name: string;
                login: string;
                active: boolean;
                is_admin: boolean;
                password?: string;
            } = {
                name: userForm.name,
                login: userForm.login,
                active: userForm.active,
                is_admin: userForm.is_admin,
            };

            if (userForm.password.trim()) {
                payload.password = userForm.password;
            }

            await updateAdminUser(selectedUserId, payload, accessToken);

            setUserSuccess('Usuário atualizado com sucesso.');
            await fetchUsers();
        } catch (error) {
            setUsersError(error instanceof Error ? error.message : 'Falha ao salvar usuário.');
        } finally {
            setIsSavingUser(false);
        }
    };

    const deleteUser = async (userId: number) => {
        setDeletingUserId(userId);
        setUsersError(null);
        setUserSuccess(null);

        try {
            await deleteAdminUser(userId, accessToken);

            if (selectedUserId === userId) {
                setSelectedUserId(null);
                syncUserForm(null);
            }

            setUserSuccess('Usuário removido com sucesso.');
            await fetchUsers();
        } catch (error) {
            setUsersError(error instanceof Error ? error.message : 'Falha ao remover usuário.');
        } finally {
            setDeletingUserId(null);
        }
    };

    const handleToggleAdmin = async (user: ApiUser) => {
        setTogglingAdminId(user.id);
        setUsersError(null);
        setUserSuccess(null);

        try {
            await toggleUserAdminRole(user, accessToken);

            setUserSuccess(!user.is_admin ? 'Usuário promovido para administrador.' : 'Perfil administrativo removido.');
            await fetchUsers();
        } catch (error) {
            setUsersError(error instanceof Error ? error.message : 'Falha ao alterar perfil administrativo.');
        } finally {
            setTogglingAdminId(null);
        }
    };

    return {
        users,
        selectedUserId,
        selectedUser,
        userForm,
        registerUserForm,
        isLoadingUsers,
        isSavingUser,
        isCreatingUser,
        deletingUserId,
        togglingAdminId,
        usersError,
        userSuccess,
        fetchUsers,
        handleSelectUser,
        handleUserFieldChange,
        handleRegisterFieldChange,
        handleRegisterUser,
        handleSaveUser,
        deleteUser,
        handleToggleAdmin,
    };
};
