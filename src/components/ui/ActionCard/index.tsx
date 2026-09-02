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
            className={`group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border p-[clamp(0.65rem,2.2vh,1.25rem)] text-left transition-all duration-300 hover:-translate-y-1 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 ${styles.bg} ${styles.card} ${styles.ring}`}
        >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="mb-[clamp(0.25rem,1.2vh,0.75rem)] flex min-h-0 shrink-0 items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className={`material-icons-outlined flex h-[clamp(1.75rem,6vh,3.5rem)] w-[clamp(1.75rem,6vh,3.5rem)] shrink-0 items-center justify-center rounded-2xl !text-[clamp(1rem,3vh,1.75rem)] ${styles.icon}`}>
                            {icon}
                        </span>

                        {badges && badges.length > 0 && (
                            <div className="flex flex-wrap items-center content-center gap-1.5">
                                {badges.map((badge) => (
                                    <span
                                        key={badge.label}
                                        className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-[clamp(0.4rem,1vh,0.65rem)] py-[clamp(0.1rem,0.4vh,0.25rem)] text-[clamp(0.6rem,1.4vh,0.75rem)] font-semibold text-orange-700"
                                    >
                                        {badge.imageSrc ? (
                                            <img
                                                src={badge.imageSrc}
                                                alt={badge.label}
                                                className="h-[clamp(0.7rem,1.6vh,1rem)] w-[clamp(0.7rem,1.6vh,1rem)] object-contain"
                                            />
                                        ) : (
                                            <span className="material-icons-outlined !text-[clamp(0.7rem,1.6vh,1rem)] leading-none">{badge.icon}</span>
                                        )}
                                        <span>{badge.label}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className={`material-icons-outlined translate-x-0 shrink-0 !text-[clamp(1.1rem,3.2vh,1.75rem)] transition-transform duration-300 group-hover:translate-x-1 ${styles.arrow}`}>
                        arrow_forward
                    </span>
                </div>
                <span className="min-h-0 shrink-0 text-[clamp(0.95rem,2.6vh,1.7rem)] font-semibold leading-tight text-slate-900">{title}</span>
                {subtitle && (
                    <span className="line-clamp-2 min-h-0 text-[clamp(0.7rem,1.8vh,1rem)] font-medium leading-relaxed text-slate-500">{subtitle}</span>
                )}
            </div>
            <span className="mt-[clamp(0.25rem,1vh,0.75rem)] shrink-0 text-[clamp(0.6rem,1.4vh,0.75rem)] font-semibold uppercase tracking-wide text-slate-400">Toque para continuar</span>
        </button>
    );
};

export default ActionCard;
