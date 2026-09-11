import React from 'react';
import { SERVICE_COLOR_HEX, SERVICE_COLOR_NEON_CLASS, type ServiceColor } from '../../../constants/serviceTypeColors';

interface BadgeProps {
  color: ServiceColor;
  children: React.ReactNode;
  size?: 'default' | 'hero';
  neonBorder?: boolean;
  className?: string;
}

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  default: 'px-4 sm:px-5 py-2 sm:py-2.5 text-[clamp(1.05rem,1.4vw,1.95rem)] shadow-md',
  hero: 'px-6 sm:px-8 py-3 sm:py-4 text-[clamp(1.3rem,2.3vw,3.9rem)] shadow-xl',
};

const Badge: React.FC<BadgeProps> = ({ color, children, size = 'default', neonBorder = false, className }) => {
  const neonColorClass = SERVICE_COLOR_NEON_CLASS[color];

  return (
  <span
    className={`inline-flex items-center justify-center rounded-full text-white font-extrabold tracking-wide ${sizeStyles[size]} ${neonBorder ? `border-2 ${neonColorClass}` : ''} ${className ?? ''}`}
    style={{ background: SERVICE_COLOR_HEX[color] }}
  >
    {children}
  </span>
);
};

export default Badge;
