import Footer from "@/app/_components/footer";
import { CookieConsentModal } from "@/app/_components/cookie-consent-modal";
import { Toaster } from "@/app/_components/ui/sonner";
import AuthProvider from "@/app/_providers/auth";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Barbeiro",
  description: "Seu aplicativo de agendamento para barbearias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <AuthProvider>
          <div className="flex-1">{children}</div>
          <Toaster />
          <Footer />
          <CookieConsentModal />
        </AuthProvider>
      </body>
    </html>
  );
}
