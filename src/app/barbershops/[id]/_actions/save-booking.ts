"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

interface SaveBookingParams {
  barbershopId: string;
  serviceId: string;
  userId: string;
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}

export const saveBooking = async (params: SaveBookingParams) => {
  // Cria a data usando Date.UTC para garantir que os valores exatos sejam preservados
  // Isso evita conversões automáticas de timezone
  // O PostgreSQL receberá o timestamp exato sem conversão
  const bookingDate = new Date(
    Date.UTC(params.year, params.month - 1, params.day, params.hours, params.minutes, 0, 0)
  );
  
  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      userId: params.userId,
      date: bookingDate,
      barbershopId: params.barbershopId,
    },
  });

  revalidatePath("/");
  revalidatePath("/bookings");
};
