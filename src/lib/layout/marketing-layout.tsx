import type { ReactNode } from 'react';

import { Footer } from './components/footer';

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-fg" data-shell="marketing">
      {children}
      <div className="mx-auto w-full max-w-7xl">
        <Footer />
      </div>
    </div>
  );
}
