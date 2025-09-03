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
        {/* Completely disable CSP via meta tag */}
        <meta httpEquiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src *; connect-src *; media-src *; object-src *; child-src *; frame-src *; worker-src *; frame-ancestors *; form-action *;" />
        
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

              // Suppress extension-related errors
              window.addEventListener('error', function(event) {
                const errorMessage = event.message || '';
                const source = event.filename || '';
                
                // Suppress common extension errors
                if (source.includes('watch.js') || 
                    source.includes('extension') ||
                    errorMessage.includes('couponCheckingRequireAt') ||
                    errorMessage.includes('Cannot set properties of undefined')) {
                  event.preventDefault();
                  return false;
                }
              });

              // Override console.error for extension errors in development
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && 
                      (message.includes('couponCheckingRequireAt') || 
                       message.includes('watch.js'))) {
                    return; // Suppress these specific errors
                  }
                  originalError.apply(console, args);
                };
              }
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
