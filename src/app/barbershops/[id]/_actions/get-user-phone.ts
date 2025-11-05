"use server";

import { db } from "@/app/_lib/prisma";

export const getUserPhone = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      phone: true,
    },
  });

  return user?.phone || "";
};
