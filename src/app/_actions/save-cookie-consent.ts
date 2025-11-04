'use server';

import { db } from '@/app/_lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveCookieConsent(userId: string, consent: boolean) {
  await db.user.update({
    where: {
      id: userId
    },
    data: {
      cookieConsent: consent,
      cookieConsentDate: new Date()
    }
  });

  revalidatePath('/');
}
