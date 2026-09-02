import React from 'react';

const GetTicketHero: React.FC = () => {
    return (
        <div className="mb-[clamp(0.5rem,2vh,2rem)] flex shrink-0 flex-col gap-[clamp(0.15rem,0.6vh,0.5rem)]">
            <h1 className="text-[clamp(1.3rem,4.5vh,3rem)] font-semibold leading-tight text-slate-900">
                Retire aqui sua senha
            </h1>
            <p className="max-w-2xl text-[clamp(0.8rem,2vh,1.125rem)] leading-relaxed text-slate-500">
                Selecione uma opção abaixo para iniciar seu atendimento de forma rápida.
            </p>
        </div>
    );
};

export default GetTicketHero;
