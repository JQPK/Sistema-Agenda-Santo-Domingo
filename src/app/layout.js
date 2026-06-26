import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Script from 'next/script';

export const metadata = {
  title: 'Agenda Parroquial Santo Domingo',
  description: 'Sistema de gestión de agenda y actividades para la Parroquia Santo Domingo',
};

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/globe.svg" />
      </head>
      <body>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/firebase-messaging-sw.js').then(function(registration) {
                  console.log('SW registrado con éxito con el scope: ', registration.scope);
                }, function(err) {
                  console.log('Fallo en el registro del SW: ', err);
                });
              });
            }
          `}
        </Script>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
