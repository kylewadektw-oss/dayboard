import { PropsWithChildren } from 'react';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';

export default function MarketingLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main
        id="skip"
        className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
