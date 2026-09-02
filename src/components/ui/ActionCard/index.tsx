import React from 'react';
import type { ServiceColor } from '../../../constants/serviceTypeColors';

interface ActionCardProps {
    icon: string;
    title: string;
    variant: ServiceColor;
    subtitle?: string;
    badges?: Array<{
        icon?: string;
        imageSrc?: string;
        label: string;
    }>;
    onClick?: () => void;
}

const variantStyles: Record<ServiceColor, { icon: string; ring: string; arrow: string; card: string; bg: string }> = {
    blue: {
        icon: 'bg-blue-100 text-blue-700',
        ring: 'focus-visible:ring-blue-300',
        arrow: 'text-blue-700',
        card: 'border-blue-400/90 hover:border-blue-400 neon-pulse-blue hover:shadow-[0_0_0_1px_rgba(59,130,246,0.72),0_0_36px_rgba(59,130,246,0.66)]',
        bg: 'bg-blue-50/70',
    },
    amber: {
        icon: 'bg-amber-100 text-amber-700',
        ring: 'focus-visible:ring-amber-300',
        arrow: 'text-amber-700',
        card: 'border-amber-400/90 hover:border-amber-400 neon-pulse-amber hover:shadow-[0_0_0_1px_rgba(251,191,36,0.72),0_0_36px_rgba(251,191,36,0.66)]',
        bg: 'bg-amber-50/70',
    },
    red: {
        icon: 'bg-red-100 text-red-700',
        ring: 'focus-visible:ring-red-300',
        arrow: 'text-red-700',
        card: 'border-red-400/90 hover:border-red-400 neon-pulse-red hover:shadow-[0_0_0_1px_rgba(248,113,113,0.72),0_0_36px_rgba(248,113,113,0.66)]',
        bg: 'bg-red-50/70',
    },
    indigo: {
        icon: 'bg-indigo-100 text-indigo-700',
        ring: 'focus-visible:ring-indigo-300',
        arrow: 'text-indigo-700',
        card: 'border-indigo-400/90 hover:border-indigo-400 neon-pulse-indigo hover:shadow-[0_0_0_1px_rgba(99,102,241,0.72),0_0_36px_rgba(99,102,241,0.66)]',
        bg: 'bg-indigo-50/70',
    },
    emerald: {
        icon: 'bg-emerald-100 text-emerald-700',
        ring: 'focus-visible:ring-emerald-300',
        arrow: 'text-emerald-700',
        card: 'border-emerald-400/90 hover:border-emerald-400 neon-pulse-emerald hover:shadow-[0_0_0_1px_rgba(16,185,129,0.72),0_0_36px_rgba(16,185,129,0.66)]',
        bg: 'bg-emerald-50/70',
    },
    rose: {
        icon: 'bg-rose-100 text-rose-700',
        ring: 'focus-visible:ring-rose-300',
        arrow: 'text-rose-700',
        card: 'border-rose-400/90 hover:border-rose-400 neon-pulse-rose hover:shadow-[0_0_0_1px_rgba(244,63,94,0.72),0_0_36px_rgba(244,63,94,0.66)]',
        bg: 'bg-rose-50/70',
    },
    cyan: {
        icon: 'bg-cyan-100 text-cyan-700',
        ring: 'focus-visible:ring-cyan-300',
        arrow: 'text-cyan-700',
        card: 'border-cyan-400/90 hover:border-cyan-400 neon-pulse-cyan hover:shadow-[0_0_0_1px_rgba(6,182,212,0.72),0_0_36px_rgba(6,182,212,0.66)]',
        bg: 'bg-cyan-50/70',
    },
    violet: {
        icon: 'bg-violet-100 text-violet-700',
        ring: 'focus-visible:ring-violet-300',
        arrow: 'text-violet-700',
        card: 'border-violet-400/90 hover:border-violet-400 neon-pulse-violet hover:shadow-[0_0_0_1px_rgba(139,92,246,0.72),0_0_36px_rgba(139,92,246,0.66)]',
        bg: 'bg-violet-50/70',
    },
};

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, subtitle, variant, badges, onClick }) => {
    const styles = variantStyles[variant];

    return (
        <button
            onClick={onClick}
            className={`group relative flex h-full min-h-[10rem] w-full flex-col rounded-3xl border p-3 text-left transition-all duration-300 hover:-translate-y-1 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 sm:min-h-[11rem] sm:p-3.5 md:min-h-[11.5rem] lg:min-h-[12rem] lg:p-4 xl:min-h-[14rem] xl:p-5 2xl:min-h-[16rem] ${styles.bg} ${styles.card} ${styles.ring}`}
        >
            <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3 lg:mb-3 lg:gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`material-icons-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl !text-2xl sm:h-12 sm:w-12 sm:!text-3xl lg:h-11 lg:w-11 xl:h-14 xl:w-14 xl:!text-3xl 2xl:h-16 2xl:w-16 2xl:!text-4xl ${styles.icon}`}>
                            {icon}
                        </span>

                        {badges && badges.length > 0 && (
                            <div className="flex flex-wrap items-center content-center gap-2">
                                {badges.map((badge) => (
                                    <span
                                        key={badge.label}
                                        className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700"
                                    >
                                        {badge.imageSrc ? (
                                            <img
                                                src={badge.imageSrc}
                                                alt={badge.label}
                                                className="h-4 w-4 object-contain"
                                            />
                                        ) : (
                                            <span className="material-icons-outlined !text-sm leading-none">{badge.icon}</span>
                                        )}
                                        <span>{badge.label}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className={`material-icons-outlined translate-x-0 !text-3xl transition-transform duration-300 group-hover:translate-x-1 ${styles.arrow}`}>
                        arrow_forward
                    </span>
                </div>
                <span className="text-[1.2rem] font-semibold leading-tight text-slate-900 sm:text-[1.35rem] lg:text-[1.3rem] xl:text-[1.55rem] 2xl:text-[1.7rem]">{title}</span>
                {subtitle && (
                    <span className="text-[0.8rem] font-medium leading-relaxed text-slate-500 sm:text-[0.875rem] lg:text-[0.84rem] xl:text-[0.92rem] 2xl:text-base">{subtitle}</span>
                )}
            </div>
            <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:text-xs lg:mt-2 xl:mt-3 2xl:mt-4">Toque para continuar</span>
        </button>
    );
};

export default ActionCard;
