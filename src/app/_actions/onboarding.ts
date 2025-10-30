"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";

export const setUserAsClient = async (userId: string) => {
  try {
    await db.user.update({
      where: { id: userId },
      data: { role: "CLIENT" },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao definir usuário como cliente:", error);
    return { success: false, error: "Erro ao definir usuário como cliente" };
  }
};

export const setUserAsBarber = async (userId: string, barbershopId: string) => {
  try {
    // Verificar se a barbearia já tem um barbeiro
    const existingBarber = await db.barber.findFirst({
      where: { barbershopId },
      include: { user: true },
    });

    if (existingBarber) {
      return {
        success: false,
        error: `Esta barbearia já possui um barbeiro vinculado (${existingBarber.user.name || existingBarber.user.email})`,
      };
    }

    // Verificar se o usuário já é barbeiro de outra barbearia
    const userBarber = await db.barber.findUnique({
      where: { userId },
    });

    if (userBarber) {
      return {
        success: false,
        error: "Você já está vinculado a uma barbearia",
      };
    }

    // Atualizar role do usuário e criar vínculo com barbearia
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { role: "BARBER" },
      }),
      db.barber.create({
        data: {
          userId,
          barbershopId,
        },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/barber-dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao definir usuário como barbeiro:", error);
    return { success: false, error: "Erro ao definir usuário como barbeiro" };
  }
};

export const getAllBarbershops = async () => {
  try {
    const barbershops = await db.barbershop.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        imageUrl: true,
        _count: {
          select: {
            barbers: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return barbershops;
  } catch (error) {
    console.error("Erro ao buscar barbearias:", error);
    return [];
  }
};

export const createBarbershopAndSetBarber = async (
  userId: string,
  barbershopData: {
    name: string;
    address: string;
    imageUrl: string;
  }
) => {
  try {
    // Verificar se o usuário já é barbeiro de outra barbearia
    const userBarber = await db.barber.findUnique({
      where: { userId },
    });

    if (userBarber) {
      return {
        success: false,
        error: "Você já está vinculado a uma barbearia",
      };
    }

    // Criar barbearia, atualizar role do usuário e criar vínculo
    const result = await db.$transaction(async (tx) => {
      const barbershop = await tx.barbershop.create({
        data: {
          name: barbershopData.name,
          address: barbershopData.address,
          imageUrl: barbershopData.imageUrl,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: "BARBER" },
      });

      await tx.barber.create({
        data: {
          userId,
          barbershopId: barbershop.id,
        },
      });

      return barbershop;
    });

    revalidatePath("/");
    revalidatePath("/barber-dashboard");

    return { success: true, barbershopId: result.id };
  } catch (error) {
    console.error("Erro ao criar barbearia:", error);
    return { success: false, error: "Erro ao criar barbearia" };
  }
};
