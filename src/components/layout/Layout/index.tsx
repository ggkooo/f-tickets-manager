import React, { type ReactNode } from 'react';
import Header from '../Header';

interface LayoutProps {
    children: ReactNode;
    contentClassName?: string;
    showHeader?: boolean;
    fitViewport?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, contentClassName, showHeader = true, fitViewport = false }) => {
    const defaultContentClassName = 'mx-auto flex w-[94%] flex-grow flex-col items-center justify-center py-8 sm:w-[90%] md:py-10 lg:w-[78%] xl:w-[70%]';

    return (
        <div
            className={`bg-background-light text-slate-800 flex flex-col w-full ${fitViewport ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}`}
        >
            {showHeader ? <Header /> : null}
            <main className={`${contentClassName ?? defaultContentClassName} ${fitViewport ? 'min-h-0 overflow-hidden' : ''}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
