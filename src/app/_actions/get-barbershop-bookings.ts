"use server";

import { db } from "@/app/_lib/prisma";
import { convertDbDateToLocal } from "@/app/_helpers/date";

export const getBarbershopBookings = async (barbershopId: string) => {
  const bookings = await db.booking.findMany({
    where: {
      barbershopId,
    },
    include: {
      service: true,
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return bookings.map((booking) => ({
    ...booking,
    date: convertDbDateToLocal(booking.date),
  }));
};

export const getBarbershopBookingsByDate = async (
  barbershopId: string,
  startDate: Date,
  endDate: Date,
) => {
  const bookings = await db.booking.findMany({
    where: {
      barbershopId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      service: true,
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return bookings.map((booking) => ({
    ...booking,
    date: convertDbDateToLocal(booking.date),
  }));
};

export const getTodayBarbershopBookings = async (barbershopId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getBarbershopBookingsByDate(barbershopId, today, tomorrow);
};

export const getUpcomingBarbershopBookings = async (barbershopId: string) => {
  const now = new Date();

  const bookings = await db.booking.findMany({
    where: {
      barbershopId,
      date: {
        gte: now,
      },
    },
    include: {
      service: true,
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return bookings.map((booking) => ({
    ...booking,
    date: convertDbDateToLocal(booking.date),
  }));
};
