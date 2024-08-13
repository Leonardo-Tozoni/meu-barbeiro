import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from './_components/Footer';
import { Toaster } from './_components/ui/sonner';
import './globals.css';
import AuthProvider from './providers/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meu Barbeiro',
  description: 'Seu APP para agendamento de barbearia'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
