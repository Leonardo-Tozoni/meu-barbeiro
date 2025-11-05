'use server';

import { db } from '@/app/_lib/prisma';
import { revalidatePath } from 'next/cache';

interface SaveBookingParams {
  barbershopId: string;
  serviceId: string;
  userId: string;
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  phone: string;
}

export const saveBooking = async (params: SaveBookingParams) => {
  const bookingDate = new Date(
    Date.UTC(
      params.year,
      params.month - 1,
      params.day,
      params.hours,
      params.minutes,
      0,
      0
    )
  );

  await db.user.update({
    where: {
      id: params.userId
    },
    data: {
      phone: params.phone
    }
  });

  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      userId: params.userId,
      date: bookingDate,
      barbershopId: params.barbershopId
    }
  });

  revalidatePath('/');
  revalidatePath('/bookings');
};
