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
        {/* CSP is handled by middleware.ts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension communication errors
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message) {
                  const msg = event.reason.message;
                  if (msg.includes('message channel closed') || 
                      msg.includes('listener indicated an asynchronous response')) {
                    event.preventDefault();
                    return false;
                  }
                }
              });
            `,
          }}
        />
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
