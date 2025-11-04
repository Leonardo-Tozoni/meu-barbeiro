'use client';

import { saveCookieConsent } from '@/app/_actions/save-cookie-consent';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function CookieConsentModal() {
  const { data: session, update } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setIsVisible(false);
      return;
    }

    const cookieConsent = (session.user as any).cookieConsent;
    
    console.log('Cookie consent status:', cookieConsent);

    if (cookieConsent === true) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }, [session]);

  const handleAccept = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    const userId = (session.user as any).id;

    try {
      await saveCookieConsent(userId, true);
      await update();
      setIsVisible(false);
    } catch (error) {
      console.error('Erro ao salvar consentimento:', error);
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-2">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-card border border-border shadow-lg p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm text-foreground">
                🍪 Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com o uso de cookies.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                disabled={isLoading}
              >
                Recusar
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Aceitar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
