import { PropsWithChildren } from 'react';
import Footer from '@/components/ui/Footer';

export default function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <>
      <main
        id="skip"
        className="min-h-screen"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
