import React, { type ReactNode } from 'react';

interface LoginCardProps {
    children: ReactNode;
}

const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg p-7 sm:p-8 lg:p-10 border border-slate-200/80 w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>
            <div className="text-center mb-7 lg:mb-8">
                <span className="material-icons-outlined text-5xl text-primary mb-3">
                    account_circle
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Acesso Restrito</h2>
                <p className="text-slate-500 mt-1.5">Área do Atendente</p>
            </div>

            {children}
        </div>
    );
};

export default LoginCard;
