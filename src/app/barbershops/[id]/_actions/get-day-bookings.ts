"use server";

import { db } from "@/app/_lib/prisma";
import { convertDbDateToLocal } from "@/app/_helpers/date";

export const getDayBookings = async (barbershopId: string, date: Date) => {
  // Cria data de início do dia em UTC (00:00:00)
  const startDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ));
  
  // Cria data de fim do dia em UTC (23:59:59)
  const endDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59, 999
  ));

  const bookings = await db.booking.findMany({
    where: {
      barbershopId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Converte as datas do banco (UTC) para horário local
  return bookings.map((booking) => ({
    ...booking,
    date: convertDbDateToLocal(booking.date),
  }));
};
