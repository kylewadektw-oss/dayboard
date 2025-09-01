import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainLayout from "@/components/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Dayboard - Your Family Command Center",
  description: "Organize calendars, meals, grocery lists, weather, and family updates into one elegant dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* CSP temporarily disabled for development to resolve eval() warnings */}
        {false && process.env.NODE_ENV !== 'production' && (
          <meta 
            httpEquiv="Content-Security-Policy" 
            content="default-src * 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes'; script-src * 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' data: blob: https: http: ws: wss: https://accounts.google.com https://accounts.youtube.com https://apis.google.com https://www.google.com https://ssl.gstatic.com https://www.gstatic.com; style-src * 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.google.com; img-src * 'self' data: blob: https: http: https://accounts.google.com https://www.google.com; connect-src * 'self' ws: wss: https: http: https://accounts.google.com https://apis.google.com; font-src * 'self' data: https: https://fonts.gstatic.com; frame-src * 'self' https: https://accounts.google.com https://www.google.com; object-src 'none'; base-uri 'self';" 
          />
        )}
      </head>
      <body
        className="antialiased font-sans"
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        <AuthProvider>
          <Sidebar />
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
