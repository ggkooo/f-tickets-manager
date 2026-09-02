import React from 'react';
import { useLocation } from 'react-router-dom';
import unilabLogo from '../../../assets/logo-unilab.png';
import creLogo from '../../../assets/logo-unijui.png';
import Clock from '../../ui/Clock';

const Header: React.FC = () => {
  const location = useLocation();
  const showClock = location.pathname.endsWith('/tv');
  const isCre = location.pathname === '/cre' || location.pathname.startsWith('/cre/');
  const headerSpacingClass = showClock
    ? 'px-4 sm:px-5 lg:px-8 py-2 sm:py-2.5 xl:py-3'
    : 'px-4 sm:px-6 lg:px-10 py-3 sm:py-4 xl:py-5';
  const logoSizeClass = showClock
    ? 'w-[clamp(100px,6.8vw,220px)] object-contain'
    : 'w-[clamp(110px,8vw,260px)] object-contain';
  // The CRE mark is a squarer, denser logo than Unilab's — capped smaller so it
  // doesn't visually dominate the header next to the wordmark-style Unilab logo.
  const creLogoSizeClass = showClock
    ? 'h-[clamp(32px,4vw,52px)] w-auto object-contain'
    : 'h-[clamp(36px,4.6vw,60px)] w-auto object-contain';
  const spacerSizeClass = showClock
    ? 'w-[clamp(100px,6.8vw,220px)]'
    : 'w-[clamp(110px,8vw,260px)]';

  return (
    <header className={`w-full bg-white border-b border-slate-200 flex justify-between items-center shadow-sm ${headerSpacingClass}`}>
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        {isCre ? (
          <img
            src={creLogo}
            alt="CRE"
            className={creLogoSizeClass}
          />
        ) : (
          <img
            src={unilabLogo}
            alt="UNILAB Logo"
            className={logoSizeClass}
          />
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {showClock ? <Clock /> : null}
      </div>

      <div className={spacerSizeClass} />
    </header>
  );
};

export default Header;
