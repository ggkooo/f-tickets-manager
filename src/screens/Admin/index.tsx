import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { clearAuthSession, getAccessToken, getAuthSession } from '../../auth/session';
import { buildLocationLoginPath } from '../../locations';
import AdminHero from './components/AdminHero';
import ConfirmActionDialog from './components/ConfirmActionDialog';
import ReportSection from './components/ReportSection';
import SummaryCards from './components/SummaryCards';
import PrinterSettingsCard from './components/PrinterSettingsCard';
import UsersSection from './components/UsersSection';
import VideoManagementCard from './components/VideoManagementCard';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useAttendanceReport } from './hooks/useAttendanceReport';
import { useConfirmDialog } from './hooks/useConfirmDialog';
import { usePrinterSettings } from './hooks/usePrinterSettings';
import { useVideoManagement } from './hooks/useVideoManagement';
import { formatLoginLabel } from './utils';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const authSession = getAuthSession();
    const currentUser = authSession?.data.user;
    const accessToken = getAccessToken() ?? undefined;
    const isSuperAdmin = currentUser?.is_super_admin ?? false;

    const adminUsers = useAdminUsers(accessToken, isSuperAdmin);
    const printerSettings = usePrinterSettings(accessToken, isSuperAdmin);
    const attendanceReport = useAttendanceReport(accessToken, currentUser?.location);
    const videoManagement = useVideoManagement(accessToken, isSuperAdmin);
    const confirmDialog = useConfirmDialog();

    const handleDeleteUser = (userId: number) => {
        confirmDialog.open({
            title: 'Remover usuário',
            message: 'Deseja realmente remover este usuário? Esta ação não pode ser desfeita.',
            confirmLabel: 'Remover usuário',
            onConfirm: async () => {
                await adminUsers.deleteUser(userId);
            },
        });
    };

    const handleLogout = () => {
        const nextLoginPath = buildLocationLoginPath(currentUser?.location ?? 'campus');
        clearAuthSession();
        navigate(nextLoginPath, { replace: true });
    };

    return (
        <Layout contentClassName="mx-auto flex w-[97%] flex-grow flex-col items-center justify-start py-8 sm:w-[95%] md:py-10 lg:w-[92%] xl:w-[90%]">
            <section className="w-full max-w-[112rem]">
                <AdminHero
                    administratorName={currentUser?.name ?? '-'}
                    loginLabel={formatLoginLabel(currentUser?.login ?? '-')}
                    canManage={isSuperAdmin}
                    onLogout={handleLogout}
                />

                <div className={`grid gap-8 ${isSuperAdmin ? 'xl:grid-cols-[1.25fr_0.95fr]' : 'xl:grid-cols-1'}`}>
                    {isSuperAdmin ? (
                        <div className="flex flex-col gap-8">
                            <UsersSection
                                users={adminUsers.users}
                                selectedUserId={adminUsers.selectedUserId}
                                selectedUser={adminUsers.selectedUser}
                                userForm={adminUsers.userForm}
                                registerUserForm={adminUsers.registerUserForm}
                                usersError={adminUsers.usersError}
                                userSuccess={adminUsers.userSuccess}
                                isLoadingUsers={adminUsers.isLoadingUsers}
                                isSavingUser={adminUsers.isSavingUser}
                                isCreatingUser={adminUsers.isCreatingUser}
                                deletingUserId={adminUsers.deletingUserId}
                                togglingAdminId={adminUsers.togglingAdminId}
                                onRefreshUsers={adminUsers.fetchUsers}
                                onSelectUser={adminUsers.handleSelectUser}
                                onToggleAdmin={adminUsers.handleToggleAdmin}
                                onDeleteUser={handleDeleteUser}
                                onSaveUser={adminUsers.handleSaveUser}
                                onRegisterUser={adminUsers.handleRegisterUser}
                                onRegisterNameChange={(value) => adminUsers.handleRegisterFieldChange('name', value)}
                                onRegisterLoginChange={(value) => adminUsers.handleRegisterFieldChange('login', value)}
                                onRegisterPasswordChange={(value) => adminUsers.handleRegisterFieldChange('password', value)}
                                onRegisterPasswordConfirmationChange={(value) => adminUsers.handleRegisterFieldChange('passwordConfirmation', value)}
                                onNameChange={(value) => adminUsers.handleUserFieldChange('name', value)}
                                onLoginChange={(value) => adminUsers.handleUserFieldChange('login', value)}
                                onPasswordChange={(value) => adminUsers.handleUserFieldChange('password', value)}
                                onActiveChange={(value) => adminUsers.handleUserFieldChange('active', value)}
                                onIsAdminChange={(value) => adminUsers.handleUserFieldChange('is_admin', value)}
                            />
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 text-slate-700 shadow-sm lg:p-8">
                            <h2 className="text-xl font-bold text-slate-900">Acesso de consulta</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 lg:text-base">
                                Seu perfil de administrador permite apenas consulta e exportacao de relatorios.
                                Funcoes de gestao de usuarios e configuracoes ficam disponiveis apenas para superadministrador.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-8">
                        <ReportSection
                            startDate={attendanceReport.startDate}
                            endDate={attendanceReport.endDate}
                            reportError={attendanceReport.reportError}
                            reportSuccess={attendanceReport.reportSuccess}
                            isDownloadingReport={attendanceReport.isDownloadingReport}
                            onStartDateChange={attendanceReport.setStartDate}
                            onEndDateChange={attendanceReport.setEndDate}
                            onDownloadReport={attendanceReport.handleDownloadReport}
                        />

                        {isSuperAdmin ? (
                            <PrinterSettingsCard
                                printers={printerSettings.printerForms.map((printer) => ({
                                    id: printer.id,
                                    name: printer.form.name,
                                }))}
                                form={printerSettings.printerForm}
                                editingPrinterId={printerSettings.editingPrinterId}
                                isLoading={printerSettings.isLoadingPrinterSettings}
                                isSaving={printerSettings.isSavingPrinterForm}
                                errorMessage={printerSettings.printerError}
                                successMessage={printerSettings.printerSuccess}
                                onPrinterFieldChange={printerSettings.handlePrinterFieldChange}
                                onEditPrinter={printerSettings.handleEditPrinter}
                                onCancelEdit={printerSettings.handleCancelPrinterEdit}
                                onSubmit={printerSettings.handleSubmitPrinterForm}
                                onReload={printerSettings.refreshPrinterSettings}
                            />
                        ) : null}

                        {isSuperAdmin ? (
                            <VideoManagementCard
                                videos={videoManagement.videos}
                                linkUrl={videoManagement.linkUrl}
                                isLoadingVideos={videoManagement.isLoadingVideos}
                                isUploadingVideo={videoManagement.isUploadingVideo}
                                isAddingLink={videoManagement.isAddingLink}
                                deletingVideoId={videoManagement.deletingVideoId}
                                errorMessage={videoManagement.videoError}
                                successMessage={videoManagement.videoSuccess}
                                onLinkUrlChange={videoManagement.setLinkUrl}
                                onUploadVideo={videoManagement.handleUploadVideo}
                                onAddLink={videoManagement.handleAddLink}
                                onDeleteVideo={videoManagement.handleDeleteVideo}
                                onReload={videoManagement.refreshVideos}
                            />
                        ) : null}

                        {isSuperAdmin ? (
                            <SummaryCards
                                usersCount={adminUsers.users.length}
                                adminsCount={adminUsers.users.filter((item) => item.is_admin).length}
                                videosCount={videoManagement.videos.length}
                            />
                        ) : null}
                    </div>
                </div>
            </section>

            <ConfirmActionDialog
                dialog={confirmDialog.dialog}
                isConfirmingAction={confirmDialog.isConfirmingAction}
                onClose={confirmDialog.handleClose}
                onConfirm={confirmDialog.handleConfirm}
            />
        </Layout>
    );
};

export default Admin;
